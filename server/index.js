const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

//models
const User = require('./models/User');
const Chat = require('./models/Chat');

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
app.use(cors());

mongoose.connect("mongodb://localhost:27017/chat-app")
    .then(() => console.log("DB connection Successful"))
    .catch((err) => console.log("Db connection Unsuccesful", err));

app.get('/api/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
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

