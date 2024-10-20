// app.js
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import groupRoute from './routes/group.route.js';
import messageRoute from './routes/message.route.js';
import userRoute from './routes/user.route.js';

dotenv.config({
  path: './.env',
});

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Routes
app.get("/",(req,res,next)=>{
  res.status(200).json({
     success: true,
     message: 'Wellcome to chatApp.'
  })
});
app.use("/api/v1/group", groupRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/message", messageRoute);

// Global Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong';
  if (err.name === "CastError") err.message = "Invalid ID";
  res.status(statusCode).json({
    success: false,
    message: err.message,
  });
});

const server = app.listen(process.env.PORT || 8000, () => {
  console.log(`⚙️ Server is running at port : ${process.env.PORT || 8000}`);
});

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ,
    credentials: true,
  },
});

// Online users 
const onlineUsers = new Map();

// Export io and onlineUsers
export { io, onlineUsers };

// Socket.io Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error("Authentication error"));
      socket.userId = decoded.id;
      next();
    });
  } else {
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;
  if (userId) {
    if (onlineUsers.has(userId)) {
      onlineUsers.get(userId).push(socket.id);
    } else {
      onlineUsers.set(userId, [socket.id]);
      io.emit("user-online", { userId });
    }
    // Emit the current online users to the newly connected user
    socket.emit("online-users", { onlineUsers: Array.from(onlineUsers.keys()) });
  }

  // console.log(`New client connected: ${socket.id} (User ID: ${userId})`);

  // Listen for send-msg event for private messages
  socket.on("send-msg", (data) => {
    const sendUserSockets = onlineUsers.get(data.to);
    if (sendUserSockets) {
      sendUserSockets.forEach((socketId) => {
        io.to(socketId).emit("msg-receive", { from: data.from, message: data.message });
      });
    }
  });


// Listen for delete message in private chat
socket.on('delete-msg-for-everyone', (data) => {
  const { messageId, to } = data;
  const sendUserSockets = onlineUsers.get(to);
  if (sendUserSockets) {
    sendUserSockets.forEach((socketId) => {
      io.to(socketId).emit('msg-deleted', { messageId });
    });
  }
});

socket.on('delete-group-msg-for-everyone', (data) => {
  const { groupId, messageId } = data;
  // Notify all online users in the group about the message deletion
  io.emit('group-msg-deleted', { groupId, messageId });
});

  // Handle disconnection
  socket.on("disconnect", () => {
    if (userId) {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        const index = userSockets.indexOf(socket.id);
        if (index !== -1) {
          userSockets.splice(index, 1);
          if (userSockets.length === 0) {
            onlineUsers.delete(userId);
            io.emit("user-offline", { userId });
          } else {
            onlineUsers.set(userId, userSockets);
          }
        }
      }
    }
  });

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  });
});