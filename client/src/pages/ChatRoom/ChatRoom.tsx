import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useParams, useNavigate } from 'react-router';
import { server } from '../../lib/consts';
import type { Chat } from '../../lib/types';
import styles from './ChatRoom.module.css';

export default function ChatRoom(){
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Chat[]>([]);
  const [input, setInput] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) { navigate('/'); return; }

    fetch(`${server}/api/chats`)
        .then(res => res.json())
        .then(data => setMessages(data));

    let socket: Socket | null = null;

    (async () => {
      socket = io(server, { query: { userId: id } });
      setSocket(socket);

      socket.on("message", (chat: Chat) => {
        setMessages((prev) => [...prev, chat]);
      });

      socket.on('server', (m: string) => {
        navigate('/');
        socket?.disconnect();
      });
    })();

    return () => {
      if (socket) {
          socket.disconnect();
      };
    };
  }, [id, navigate]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      const message = input;
      socket.emit("message", message);
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
