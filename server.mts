import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
// import ACTIONS from './src/actions/Actions';

const ACTIONS = {
  JOIN: "join",
  JOINED: "joined",
  DISCONNECTED: "disconnected",
  CODE_CHANGE: "code-change",
  SYNC_CODE: "sync-code",
  LEAVE: "leave",
};

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Dev only; tighten for production
    methods: ["GET", "POST"],
  },
});

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const userSocketMap: Record<string, string> = {};

function getAllConnectedClients(roomId: string) {
  const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
  return clients.map((socketId) => ({
    socketId,
    username: userSocketMap[socketId],
  }));
}

io.on("connection", (socket: Socket) => {
  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, async ({ code, socketId }) => {
    await sleep(2000);
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`Socket.IO server running on port ${PORT}`)
);
