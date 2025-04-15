'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAtom } from 'jotai'; // Import useAtom from jotai
import Client from '@/components/Client';
import Editor from '@/components/Editor';
import { language, cmtheme } from '@/app/atoms'; // Import atoms from atoms.ts
import ACTIONS from '@/actions/Actions';
import { initSocket } from '@/app/socket';

const EditorPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const roomId = params.roomId;
  const username = searchParams.get('username');

  const [lang, setLang] = useAtom(language); // Replace useRecoilState with useAtom
  const [them, setThem] = useAtom(cmtheme); // Replace useRecoilState with useAtom
  const [clients, setClients] = useState([]);

  const socketRef = useRef(null);
  const codeRef = useRef(null);

  console.log("Entered Editor Page");

  useEffect(() => {
    if (!username) {
      router.push('/');
      return;
    }
  
    console.log("Entered Use Effect");
  
    let isMounted = true;
  
    const init = async () => {
      if (socketRef.current) {
        console.log('Socket already initialized');
        return;
      }
  
      socketRef.current = await initSocket();
  
      socketRef.current.on('connect_error', (e) => {
        console.log('Socket connection error', e);
        toast.error('Socket connection failed, try again later.');
        router.push('/');
      });
  
      socketRef.current.on('connect_failed', (e) => {
        console.log('Socket connection failed', e);
        toast.error('Socket connection failed, try again later.');
        router.push('/');
      });
  
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username,
      });
  
      socketRef.current.on(ACTIONS.JOINED, ({ clients, username: joinedUsername, socketId }) => {
        if (!isMounted) return;
  
        if (joinedUsername !== username) {
          toast.success(`${joinedUsername} joined the room.`);
        }
        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
      });
  
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username: leftUsername }) => {
        if (!isMounted) return;
        toast.success(`${leftUsername} left the room.`);
        setClients((prev) => prev.filter((client) => client.socketId !== socketId));
      });
    };
  
    init();
  
    return () => {
      isMounted = false;
      socketRef.current?.off(ACTIONS.JOINED);
      socketRef.current?.off(ACTIONS.DISCONNECTED);
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [roomId, username]);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID has been copied to clipboard');
    } catch (err) {
      toast.error('Could not copy the Room ID');
      console.error(err);
    }
  };

  const leaveRoom = () => {
    router.push('/');
  };

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/logo.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>

        <label>
          Select Language:
          <select value={lang} onChange={(e) => { setLang(e.target.value); window.location.reload(); }} className="seLang">
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="clike">C / C++ / C# / Java</option>
            <option value="jsx">JSX</option>
            <option value="go">Go</option>
            <option value="htmlmixed">HTML-mixed</option>
          </select>
        </label>

        <label>
          Select Theme:
          <select value={them} onChange={(e) => { setThem(e.target.value); window.location.reload(); }} className="seLang">
            <option value="default">default</option>
            <option value="monokai">monokai</option>
            <option value="material">material</option>
            <option value="darcula">darcula</option>
          </select>
        </label>

        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>

      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </div>
    </div>
  );
};

export default EditorPage;
