import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import pool from "./config/db.js";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import emailRoutes from "./routes/email.js";
import { handleSocketConnection } from "./controllers/socketHandler.js";

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server with Express app

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  allowEIO3: true,
});

// Initialize Socket.io connection handler
handleSocketConnection(io);

// Test database route
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.use("/users", userRoutes);
app.use("/routes", requestRoutes);
app.use("/chat", chatRoutes);
app.use("/requests", requestRoutes);
app.use("/email", emailRoutes);

// Start the server (both Express and Socket.io on the same port)
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 SMOOFriends server running on port ${PORT}`);
  console.log("📡 Socket.io server ready for real-time chat");
  console.log(`🌐 Frontend should connect to: http://localhost:${PORT}`);
});
