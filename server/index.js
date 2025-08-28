const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const User = require('./models/User');
const Chat = require('./models/Chat');
const Room = require('./models/Room');

const app = express();
const port = 3000;
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:5173" }
});

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://localhost:27017/chat-app")
    .then(() => console.log("DB connection Successful"))
    .catch((err) => console.log("Db connection Unsuccessful", err));

app.get('/api/users', async (req, res) => {
    const users = await User.find({ inUse: false });
    res.json(users);
});

app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    res.json(user);
});

app.get('/api/chats', async (req, res) => {
    const chats = await Chat.find()
        .populate('sender');
    res.json(chats);
});

app.get('/api/rooms', async (req, res) => {
    const rooms = await Room.find()
        .populate('users');
    res.json(rooms);
});

app.post('/api/rooms', async (req, res) => {
    const body = req.body;
    const count = await Room.countDocuments({ creator_id: body.user._id });
    const newRoom = new Room({
        creator_id: body.user._id,
        name: body.user.name + (count + 1),
        users: [body.user],
        maxSize: body.maxSize || 2 
    });

    newRoom.save();
    res.json(newRoom);
});

const connectedUsers = new Set();

io.on('connection', async (socket) => {
    const userId = socket.handshake.query.userId;
    const room = socket.handshake.query.room;
    console.log(`User ${userId} connected`);

    let user;
    if (userId) {
        try {
            user = await User.findById(userId);
            if (user && user.inUse) {
                socket.emit('server', 'User already in use');
                socket.disconnect(true);
                return;
            }else if(user && !user.inUse){
                user.inUse = true;
                connectedUsers.add(user);
                user.save();
            }
        } catch (e) {
            socket.disconnect(true);
            return;
        }
    }

    socket.join(room);
    const roomObj = await Room.findOne({ name: room })
        .populate('users');

    if(!roomObj.users.includes(user)){
        roomObj.users.push(user);
        await roomObj.save();
    }

    socket.on(`${room}:message`, (msg) => {
        const newChat = new Chat({
            sender: user,
            message: msg
        });
        io.to(room).emit(`${room}:message`, newChat);
        newChat.save();
    });

    socket.on('disconnect', async () => {
        const update = await Room.findOneAndUpdate(
            {_id: roomObj._id},
            {$pull: {users: user._id}},
            {new: true}
        );

        connectedUsers.delete(user);

        if(connectedUsers.size <= 0){
            await Chat.deleteMany({}); 
        }

        if (userId) {
            await User.findOneAndUpdate(
                { _id: userId },
                { inUse: false },
                { new: true }
            );
        }

        socket.leave(room);
    });
});

server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
