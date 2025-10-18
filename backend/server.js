// backend/server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const meetingRoutes = require('./routes/meetings');

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

// REST endpoints
app.use('/api/meetings', meetingRoutes);

// Create HTTP server and Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*' }
});

// Simple in-memory rooms (demo). For production use Redis or DB.
const rooms = {}; // rooms[roomId] = { participants: { socketId: { userName } }, admin: socketId }

io.on('connection', socket => {
  console.log('socket connected', socket.id);

  socket.on('join-room', ({ roomId, userName, userId }) => {
    socket.join(roomId);
    rooms[roomId] = rooms[roomId] || { participants: {}, admin: null };
    rooms[roomId].participants[socket.id] = { userName, userId };
    if (!rooms[roomId].admin) rooms[roomId].admin = socket.id;

    // inform others in room
    socket.to(roomId).emit('user-joined', { socketId: socket.id, userName, userId });

    // send list of existing participants to the new user
    const existing = Object.keys(rooms[roomId].participants).filter(id => id !== socket.id);
    socket.emit('all-participants', existing);
  });

  socket.on('signal', payload => {
    // payload: { to, from, signal }
    if (!payload || !payload.to) return;
    io.to(payload.to).emit('signal', payload);
  });

  socket.on('chat-message', ({ roomId, message, userName }) => {
    io.in(roomId).emit('chat-message', { message, userName, time: Date.now() });
  });

  socket.on('disconnecting', () => {
    const roomsJoined = Array.from(socket.rooms).filter(r => r !== socket.id);
    roomsJoined.forEach(roomId => {
      if (rooms[roomId]) {
        delete rooms[roomId].participants[socket.id];
        socket.to(roomId).emit('user-left', { socketId: socket.id });
        if (rooms[roomId].admin === socket.id) {
          const remaining = Object.keys(rooms[roomId].participants);
          rooms[roomId].admin = remaining[0] || null;
          if (rooms[roomId].admin) io.to(rooms[roomId].admin).emit('you-are-admin');
        }
        if (Object.keys(rooms[roomId].participants).length === 0) delete rooms[roomId];
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/video-call-db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})
.catch(err => console.error('MongoDB connection failed', err));
