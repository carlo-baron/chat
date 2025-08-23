import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useParams, useNavigate } from 'react-router';
import styles from './ChatRoom.module.css';

const server = "http://localhost:3000";

type User = {
  _id: string,
  name: string,
  inUse: boolean,
  socketId?: string | null
};

export default function ChatRoom(){
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const ownedRef = useRef(false);

  useEffect(() => {
    if (!id) { navigate('/'); return; }

    let s: Socket | null = null;

    (async () => {
      try {
        s = io(server, { query: { userId: id } });
        setSocket(s);

        s.on("message", (msg: string) => {
          setMessages((prev) => [...prev, msg]);
        });

        s.on("connect", async () => {
          try {
            const res = await fetch(`${server}/api/users/${id}/select`, {
              method: 'PUT',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ socketId: s!.id })
            });

            if (!res.ok) {
              navigate('/');
              s!.disconnect();
              return;
            }

            const data: User = await res.json();
            ownedRef.current = true;
            setCurrentUser(data);
          } catch (e) {
            navigate('/');
            s!.disconnect();
          }
        });

        s.on('server', (m: string) => {
          navigate('/');
          s?.disconnect();
        });

      } catch (err) {
        console.error("Init error:", err);
        navigate('/');
        if (s) s.disconnect();
      }
    })();

    return () => {
      if (s) s.disconnect();
    };
  }, [id, navigate]);

  const sendMessage = () => {
    if (socket && input.trim() && currentUser) {
      const message = `${currentUser.name}: ${input}`;
      socket.emit("message", message);
      setInput("");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.map((m, i) => (
          <p style={{ background: i % 2 === 0 ? "white" : "gray" }} key={i}>
            {m}
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
