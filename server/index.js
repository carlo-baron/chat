const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { createServer } = require('node:http');
const { Server } = require('socket.io');

const User = require('./models/User');
const Chat = require('./models/Chat');

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

app.put('/api/users/:id/select', async (req, res) => {
  const { id } = req.params;
  const { socketId } = req.body;

  if (!socketId) {
    return res.status(400).json({ message: "socketId required" });
  }

  const user = await User.findOneAndUpdate(
    { _id: id, $or: [{ inUse: false }, { socketId }] },
    { inUse: true, socketId },
    { new: true }
  );

  if (!user) {
    return res.status(409).json({ message: "User already in use" });
  }

  return res.json(user);
});

io.on('connection', async (socket) => {
  const userId = socket.handshake.query.userId;
  console.log(`User ${userId} connected (socket ${socket.id})`);

  if (userId) {
    try {
      const u = await User.findById(userId);
      if (u && u.inUse && u.socketId && u.socketId !== socket.id) {
        socket.emit('server', 'User already in use');
        socket.disconnect(true);
        return;
      }
    } catch (e) {
      socket.disconnect(true);
      return;
    }
  }

  socket.on('message', (msg) => {
    console.log("message received:", msg);
    io.emit("message", msg);
  });

  socket.on('disconnect', async () => {
    console.log(`socket ${socket.id} disconnected`);
    if (userId) {
      const updated = await User.findOneAndUpdate(
        { _id: userId, socketId: socket.id },
        { inUse: false, socketId: null },
        { new: true }
      );

      if (updated) {
        console.log(`User with id ${userId} has been reset (owner socket ${socket.id})`);
      } else {
        console.log(`No reset: socket ${socket.id} did not own user ${userId}`);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
