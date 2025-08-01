import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import pool from "./config/db.js";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { handleSocketConnection } from "./controllers/socketHandler.js";

const app = express();
const server = http.createServer(app);
dotenv.config();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.listen(3001);

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

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/users", userRoutes);
app.use("/routes", requestRoutes);
app.use("/chat", chatRoutes);

// Start the Socket.io server
server.listen(3002, () => {
  console.log(
    "🚀 SMOOFriends server running on port 3001 (Express) and 3002 (Socket.io)"
  );
  console.log("📡 Socket.io server ready for real-time chat");
});
