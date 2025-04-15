import { io, Socket } from 'socket.io-client';

type SocketOptions = {
  'force new connection': boolean;
  reconnectionAttempt: string | number;
  timeout: number;
  transports: string[];
};

export const initSocket = async (): Promise<Socket> => {
  const options: SocketOptions = {
    'force new connection': true,
    reconnectionAttempt: 'Infinity',
    timeout: 10000,
    transports: ['websocket'],
  };

  const backendUrl = "http://localhost:4000";

  if (!backendUrl) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined');
  }

  return io(backendUrl, options);
};
