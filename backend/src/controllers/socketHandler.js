// Socket.io handler for real-time chat functionality
import pool from "../config/db.js";

// Store active users and their conversations
const activeUsers = new Map();
const conversationUsers = new Map();

const handleSocketConnection = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Extract userId from auth during connection
    const userId = socket.handshake.auth.userId;
    if (userId) {
      activeUsers.set(socket.id, userId);
      socket.userId = userId;
      console.log(`User ${userId} authenticated with socket ${socket.id}`);
    }

    // Handle joining a conversation
    socket.on("join_conversation", async (conversationId) => {
      try {
        // Verify user is participant in this conversation
        const participantCheck = await pool.query(
          "SELECT * FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2",
          [conversationId, socket.userId]
        );

        if (participantCheck.rows.length === 0) {
          socket.emit("error", {
            message: "Not authorized to join this conversation",
          });
          return;
        }

        socket.join(conversationId);

        // Track users in conversation
        if (!conversationUsers.has(conversationId)) {
          conversationUsers.set(conversationId, new Set());
        }
        conversationUsers.get(conversationId).add(socket.userId);

        console.log(
          `User ${socket.userId} joined conversation ${conversationId}`
        );

        // Notify other users in the conversation
        socket.to(conversationId).emit("user_joined", {
          userId: socket.userId,
          conversationId: conversationId,
        });
      } catch (error) {
        console.error("Error joining conversation:", error);
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    // Handle leaving a conversation
    socket.on("leave_conversation", (conversationId) => {
      socket.leave(conversationId);

      // Remove user from conversation tracking
      if (conversationUsers.has(conversationId)) {
        conversationUsers.get(conversationId).delete(socket.userId);
      }

      console.log(`User ${socket.userId} left conversation ${conversationId}`);

      // Notify other users in the conversation
      socket.to(conversationId).emit("user_left", {
        userId: socket.userId,
        conversationId: conversationId,
      });
    });

    // Handle sending messages
    socket.on("send_message", async (data) => {
      const { conversationId, message } = data;

      try {
        // Verify user is participant in this conversation
        const participantCheck = await pool.query(
          "SELECT * FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2",
          [conversationId, socket.userId]
        );

        if (participantCheck.rows.length === 0) {
          socket.emit("error", {
            message: "Not authorized to send messages to this conversation",
          });
          return;
        }

        // Message is already saved to database by the frontend chatService
        // Just broadcast it to other users in the conversation
        socket.to(conversationId).emit("new_message", message);

        console.log(
          `Message sent in conversation ${conversationId} by user ${socket.userId}`
        );
      } catch (error) {
        console.error("Error handling message:", error);
        socket.emit("message_error", { error: "Failed to send message" });
      }
    });

    // Handle typing indicators (optional feature)
    socket.on("typing_start", (conversationId) => {
      socket.to(conversationId).emit("user_typing", {
        userId: socket.userId,
        conversationId: conversationId,
      });
    });

    socket.on("typing_stop", (conversationId) => {
      socket.to(conversationId).emit("user_stopped_typing", {
        userId: socket.userId,
        conversationId: conversationId,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      // Clean up user from all conversations
      conversationUsers.forEach((users, conversationId) => {
        if (users.has(socket.userId)) {
          users.delete(socket.userId);
          socket.to(conversationId).emit("user_left", {
            userId: socket.userId,
            conversationId: conversationId,
          });
        }
      });

      // Remove from active users
      activeUsers.delete(socket.id);
    });
  });
};

export { handleSocketConnection };
