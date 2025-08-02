import axios from "axios";

const API_BASE_URL = "https://35.213.190.54:3001";

class ChatService {
  // Get all conversations for a user
  async getUserConversations(userId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/conversations/${userId}`
      );
      return response.data.conversations;
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  }

  // Get messages for a conversation
  async getConversationMessages(conversationId, limit = 50) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat/conversations/${conversationId}/messages?limit=${limit}`
      );

      // Transform the data to match the expected format
      return response.data.messages.map((msg) => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        user_id: msg.user_id,
        users: {
          id: msg.user_id,
          email: msg.email,
          display_name: msg.display_name,
        },
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(conversationId, userId, content) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
        {
          userId: userId,
          content: content,
        }
      );

      // Transform the response to match expected format
      const msg = response.data.message;
      return {
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        user_id: msg.user_id,
        conversation_id: conversationId,
        users: {
          id: msg.user_id,
          email: msg.email,
          display_name: msg.display_name,
        },
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  // Create a new conversation
  async createConversation(name, type = "group", creatorId) {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat/conversations`, {
        name: name,
        type: type,
        creatorId: creatorId,
      });

      return response.data.conversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  // Join a conversation
  async joinConversation(conversationId, userId) {
    try {
      await axios.post(
        `${API_BASE_URL}/chat/conversations/${conversationId}/join`,
        {
          userId: userId,
        }
      );
    } catch (error) {
      console.error("Error joining conversation:", error);
      throw error;
    }
  }

  // Mark messages as read (placeholder - implement if needed)
  async markMessagesAsRead(conversationId, userId) {
    try {
      // This would need to be implemented in the backend if you want read receipts
      console.log(
        `Marking messages as read for conversation ${conversationId} by user ${userId}`
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  }
}

export default new ChatService();
