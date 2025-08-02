// src/utils/chatStorage.js - Enhanced local storage for persistence

export class ChatStorage {
  static STORAGE_PREFIX = 'smu_chat_';
  static CONVERSATIONS_KEY = 'conversations';
  static MAX_MESSAGES_PER_CONVERSATION = 1000;

  // Generate storage key for user
  static getUserStorageKey(userId) {
    return `${this.STORAGE_PREFIX}${userId}_${this.CONVERSATIONS_KEY}`;
  }

  // Get conversation key (ensures consistent ordering)
  static getConversationKey(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  }

  // Get all conversations for a user
  static getAllConversations(userId) {
    try {
      const data = localStorage.getItem(this.getUserStorageKey(userId));
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading conversations from localStorage:', error);
      return {};
    }
  }

  // Get specific conversation between two users
  static getConversation(userId1, userId2) {
    const conversations = this.getAllConversations(userId1);
    const conversationKey = this.getConversationKey(userId1, userId2);
    const messages = conversations[conversationKey] || [];
    
    // Sort messages by timestamp to ensure correct order
    return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Save entire conversation
  static saveConversation(userId1, userId2, messages) {
    try {
      const conversations = this.getAllConversations(userId1);
      const conversationKey = this.getConversationKey(userId1, userId2);
      
      // Limit messages and sort by timestamp
      const sortedMessages = messages
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .slice(-this.MAX_MESSAGES_PER_CONVERSATION);
      
      conversations[conversationKey] = sortedMessages;
      
      localStorage.setItem(this.getUserStorageKey(userId1), JSON.stringify(conversations));
      
      return true;
    } catch (error) {
      console.error('Error saving conversation to localStorage:', error);
      return false;
    }
  }

  // Clear specific conversation
  static clearConversation(userId1, userId2) {
    try {
      const conversations = this.getAllConversations(userId1);
      const conversationKey = this.getConversationKey(userId1, userId2);
      delete conversations[conversationKey];
      
      localStorage.setItem(this.getUserStorageKey(userId1), JSON.stringify(conversations));
      
      return true;
    } catch (error) {
      console.error('Error clearing conversation from localStorage:', error);
      return false;
    }
  }

  // Clear all conversations for user
  static clearAllConversations(userId) {
    try {
      localStorage.removeItem(this.getUserStorageKey(userId));
      return true;
    } catch (error) {
      console.error('Error clearing all conversations:', error);
      return false;
    }
  }
}