const express = require('express');
const mongoose = require('mongoose');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const app = express();
const port = 3000;
const server = createServer(app);
const io = new Server(server,
    {
        cors: {
            origin: "http://localhost:5173"
        }
    }
);

app.use(express.json());

mongoose.connect("mongodb://10.255.255.254:27017/chat-app")
    .then(() => console.log("DB connection Successful"))
    .catch((err) => console.log("Db connection Unsuccesful"));

app.get('/', (req, res) => {
  res.send('Hello World!');
})

io.on('connection', (socket) => {
    socket.on('message', (msg) => {
        console.log("message received:", msg);
        io.emit("message", msg);
    });

    socket.on('disconnect', () =>{
        console.log("user disconnected");  
    });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
})

