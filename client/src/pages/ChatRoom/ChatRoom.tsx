import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams, useNavigate } from 'react-router';
import { server } from '../../lib/consts';
import type { Chat, User } from '../../lib/types';
import styles from './ChatRoom.module.css';

export default function ChatRoom() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Chat[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [input, setInput] = useState("");
  const { roomName } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionUser = sessionStorage.getItem("User");
    if (sessionUser) {
      setUser(JSON.parse(sessionUser));
    }
  }, []);

  useEffect(() => {
      if (!roomName || !user) {
        navigate('/rooms');
        return;
      }


    fetch(`${server}/api/chats`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(console.error);

    fetch(`${server}/health`).catch(console.error);

    const s = io(server, {
      transports: ["websocket"],
      query: {
        userId: user._id,
        room: roomName
      }
    });

    setSocket(s);

    s.on(`${roomName}:message`, (chat: Chat) => {
      setMessages(prev => [...prev, chat]);
    });

    return () => {
      s.disconnect();
    };
  }, [roomName, user, navigate]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit(`${roomName}:message`, input.trim());
      setInput("");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.map((m, i) => (
          <p style={{ background: i % 2 === 0 ? "white" : "gray" }} key={i}>
            {m.sender.name + ": " + m.message}
          </p>
        ))}
      </div>
      <div className={styles.userInput}>
        <input
          className={styles.messageInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
        />
        <button className={styles.messageSubmit} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
