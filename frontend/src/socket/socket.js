// src/socket/socket.js

import { io } from "socket.io-client";

let socket = null;

// Initialize socket connection
export const initializeSocket = (userId) => {
  if (socket) {
    socket.disconnect();
  }

  console.log("🔌 Initializing socket connection...");

  socket = io("http://35.213.190.54:3001", {
    transports: ["websocket", "polling"], // Try websocket first, fallback to polling
    timeout: 10000,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    autoConnect: true,
    forceNew: true,
  });

  socket.on("connect", () => {
    console.log("✅ Connected to Socket.io server!", socket.id);

    if (userId) {
      socket.emit("join", userId);
      console.log(`👤 Joined chat as user: ${userId}`);
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Disconnected from Socket.io server:", reason);

    // Handle different disconnect reasons
    if (reason === "io server disconnect") {
      // Server forcefully disconnected, need to reconnect manually
      console.log("🔄 Server disconnected, attempting to reconnect...");
      socket.connect();
    }
  });

  socket.on("connect_error", (error) => {
    console.error("🚨 Socket.io connection error:", error);
    console.log(
      "💡 Make sure your backend server is running on http://35.213.190.54:3001"
    );

    // Try different approaches based on error
    if (error.message.includes("websocket error")) {
      console.log("🔄 WebSocket failed, trying polling transport...");
      socket.io.opts.transports = ["polling"];
    }
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
  });

  socket.on("reconnect_error", (error) => {
    console.error("🚨 Reconnection failed:", error);
  });

  socket.on("reconnect_failed", () => {
    console.error("💀 Failed to reconnect to server");
  });

  return socket;
};

// Get current socket instance
export const getSocket = () => {
  return socket;
};

// Check if socket is connected
export const isSocketConnected = () => {
  return socket && socket.connected;
};

// Send private message
export const sendPrivateMessage = (messageData) => {
  if (socket && socket.connected) {
    console.log("📤 Sending private message:", messageData);
    socket.emit("private_message", messageData);
    return true;
  } else {
    console.error("❌ Cannot send message - socket not connected");
    console.log("Current socket state:", socket ? socket.connected : "null");
    return false;
  }
};

// Listen for private messages
export const onPrivateMessage = (callback) => {
  if (socket) {
    socket.on("private_message", callback);
    console.log("👂 Listening for private messages");
  }
};

// Stop listening for private messages
export const offPrivateMessage = (callback) => {
  if (socket) {
    if (callback) {
      socket.off("private_message", callback);
    } else {
      socket.off("private_message");
    }
    console.log("🔇 Stopped listening for private messages");
  }
};

// Join a room/user session
export const joinUser = (userId) => {
  if (socket && socket.connected) {
    socket.emit("join", userId);
    console.log(`👤 Joined as user: ${userId}`);
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    console.log("🧹 Disconnecting socket...");
    socket.disconnect();
    socket = null;
  }
};

// Default export for backwards compatibility
export default {
  initializeSocket,
  getSocket,
  isSocketConnected,
  sendPrivateMessage,
  onPrivateMessage,
  offPrivateMessage,
  joinUser,
  disconnectSocket,
};
