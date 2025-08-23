import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useParams, useNavigate } from 'react-router';
import styles from './ChatRoom.module.css';

const server = "http://localhost:3000";

type User = {
    _id: string,
    name: string,
    inUse: boolean
};

export default function ChatRoom(){
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState<User>();
  const { id } = useParams();
  const navigate = useNavigate();

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

    fetch(`${server}/api/users/${id}`)
        .then(res => res.json())
        .then(data => {
            if(data.inUse){
                navigate('/');
            }else{
                fetch(`${server}/api/users/${id}`, {
                    method: 'PUT'
                })
                    .then(res => res.json())
                    .then(data => setCurrentUser(data));
            }
        })
        .catch(err => console.log("Server Error:", err));

    return () => socket.close();
  }, []);

  const sendMessage = () => {
    if (socket && input.trim()) {
        const message = `${currentUser.name}: ` + input;
      socket.emit("message", message);
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
