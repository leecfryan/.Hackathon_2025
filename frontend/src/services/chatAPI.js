// src/services/chatAPI.js - API service layer for server communication

export class ChatAPI {
  static BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  static TIMEOUT = 10000; // 10 second timeout

  // Helper method for making API requests
  static async request(endpoint, options = {}) {
    const url = `${this.BASE_URL}${endpoint}`;
    
    const config = {
      timeout: this.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get conversation history between two users
  static async getConversation(userId1, userId2) {
    try {
      const response = await this.request(
        `/conversations/${userId1}/${userId2}`
      );
      
      const messages = (Array.isArray(response) ? response : []).map(msg => ({
        id: msg.id,
        from: msg.from,
        to: msg.to,
        message: msg.message,
        timestamp: msg.timestamp,
        status: msg.status || 'sent'
      }));
      
      return messages;
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      throw error;
    }
  }

  // Send a new message
  static async sendMessage(messageData) {
    try {
      const response = await this.request('/messages', {
        method: 'POST',
        body: JSON.stringify(messageData)
      });

      return {
        id: response.id || messageData.id,
        from: messageData.from,
        to: messageData.to,
        message: messageData.message,
        timestamp: response.timestamp || messageData.timestamp,
        status: 'sent'
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  // Save incoming message
  static async saveIncomingMessage(messageData) {
    try {
      const response = await this.request('/messages/incoming', {
        method: 'POST',
        body: JSON.stringify({
          id: messageData.id,
          from: messageData.user_id,
          to: messageData.user_id === '550e8400-e29b-41d4-a716-446655440000' ? 
               '550e8400-e29b-41d4-a716-446655440001' : 
               '550e8400-e29b-41d4-a716-446655440000',
          message: messageData.content,
          timestamp: messageData.created_at
        })
      });

      return response;
    } catch (error) {
      console.error('Failed to save incoming message:', error);
      throw error;
    }
  }

  // Clear conversation
  static async clearConversation(userId1, userId2) {
    try {
      const response = await this.request(`/conversations/${userId1}/${userId2}`, {
        method: 'DELETE'
      });
      
      return response;
    } catch (error) {
      console.error('Failed to clear conversation:', error);
      throw error;
    }
  }
}