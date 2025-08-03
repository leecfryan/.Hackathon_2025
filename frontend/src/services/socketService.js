import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket && this.isConnected) {
      console.log("Socket already connected");
      return;
    }

    console.log("Connecting to socket server...");

    this.socket = io("http://localhost:3002", {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
      query: {
        userId: userId,
      },
    });

    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
      this.isConnected = true;
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.isConnected = false;
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      console.log("Disconnecting socket...");
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      console.log("Joining conversation:", conversationId);
      this.socket.emit("join_conversation", conversationId);
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      console.log("Leaving conversation:", conversationId);
      this.socket.emit("leave_conversation", conversationId);
    }
  }

  sendMessage(conversationId, message) {
    if (this.socket && this.isConnected) {
      console.log("Sending message via socket:", message);
      this.socket.emit("send_message", {
        conversationId,
        message,
      });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on("new_message", callback);
    }
  }

  onUserJoined(callback) {
    if (this.socket) {
      this.socket.on("user_joined", callback);
    }
  }

  onUserLeft(callback) {
    if (this.socket) {
      this.socket.on("user_left", callback);
    }
  }

  onTyping(callback) {
    if (this.socket) {
      this.socket.on("user_typing", callback);
    }
  }

  onStopTyping(callback) {
    if (this.socket) {
      this.socket.on("user_stop_typing", callback);
    }
  }

  startTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("typing", conversationId);
    }
  }

  stopTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit("stop_typing", conversationId);
    }
  }

  offAllListeners() {
    if (this.socket) {
      this.socket.off("new_message");
      this.socket.off("user_joined");
      this.socket.off("user_left");
      this.socket.off("user_typing");
      this.socket.off("user_stop_typing");
    }
  }
}

const socketService = new SocketService();
export default socketService;
