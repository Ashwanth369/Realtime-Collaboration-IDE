"use client";

import { useState, KeyboardEvent, ChangeEvent } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@/styles/home.css";

const Home = () => {
  const router = useRouter();

  const [roomId, setRoomId] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const createNewRoom = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Created a new room");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("ROOM ID & username are required");
      return;
    }

    // Redirect to the editor page
    router.push(`/editor/${roomId}?username=${encodeURIComponent(username)}`);
  };

  const handleInputEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img className="homePageLogo" src="/logo.png" alt="code-sync-logo" />
        <h4 className="mainLabel">
          Generate new room or paste invitation ROOM ID
        </h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="ROOM ID"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setRoomId(e.target.value)
            }
            value={roomId}
            onKeyUp={handleInputEnter}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="USERNAME"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUsername(e.target.value)
            }
            value={username}
            onKeyUp={handleInputEnter}
          />
          <button className="btn joinBtn" onClick={joinRoom}>
            Join
          </button>
          <span className="createInfo">
            If you don't have an invite, create &nbsp;
            <Link href="" onClick={createNewRoom} className="createNewBtn">
              a new room
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;
