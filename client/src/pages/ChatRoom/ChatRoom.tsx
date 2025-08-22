import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import styles from './ChatRoom.module.css';

const server = "http://localhost:3000";

export default function ChatRoom(){
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const socket = io(server);
    setSocket(socket);

    socket.on('server', (msg) => {
        const serverMessage: string = `Server: ${msg}`;
        setMessages((prev) => [...prev, serverMessage]);
    });

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.close();
  }, []);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit("message", input);
      setInput("");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.messages}>
        {messages.map((m, i) => (
          <p style={{background: i%2==0 ? ("white") : ("gray") }}key={i}>{m}</p>
        ))}
      </div>
      <div className={styles.userInput}>
          <input
            className={styles.messageInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type message..."
          />
          <button className={styles.messageSubmit} onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
