import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../Header/Header";
import chatService from "../../services/chatService";
import socketService from "../../services/socketService";
import styles from "./Chat.module.css";

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [error, setError] = useState(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize chat service and socket connection
  useEffect(() => {
    console.log("Chat component mounted");
    console.log("User:", user);

    if (user?.id) {
      initializeChat();
    } else {
      setLoading(false);
    }

    return () => {
      // Cleanup socket connection
      socketService.disconnect();
    };
  }, [user]);

  const initializeChat = async () => {
    try {
      console.log("Initializing chat for user:", user.id);

      // Connect to socket
      socketService.connect(user.id);

      // Load conversations
      const userConversations = await chatService.getUserConversations(user.id);
      console.log("Loaded conversations:", userConversations);

      setConversations(userConversations);
      setLoading(false);

      // Set up socket listeners
      socketService.onNewMessage((message) => {
        console.log("New message received:", message);
        if (
          activeConversation &&
          message.conversation_id === activeConversation.id
        ) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
      });
    } catch (error) {
      console.error("Error initializing chat:", error);
      setError(
        "Failed to connect to chat service. Please check your connection."
      );
      setLoading(false);
    }
  };

  const handleCreateChat = async (e) => {
    e.preventDefault();
    if (!newChatName.trim() || creatingChat) return;

    setCreatingChat(true);
    try {
      console.log("Creating chat:", newChatName);

      // Create conversation via API
      const newConversation = await chatService.createConversation(
        newChatName.trim(),
        "group",
        user.id
      );

      console.log("Chat created:", newConversation);

      // Add to conversations list
      setConversations((prev) => [newConversation, ...prev]);

      // Auto-select the new conversation
      setActiveConversation(newConversation);
      setMessages([]);

      // Join the conversation via socket
      socketService.joinConversation(newConversation.id);

      // Close modal
      setNewChatName("");
      setShowNewChatForm(false);
    } catch (error) {
      console.error("Error creating chat:", error);
      setError("Failed to create chat. Please try again.");
    } finally {
      setCreatingChat(false);
    }
  };

  const handleConversationClick = async (conversation) => {
    console.log("Conversation clicked:", conversation);

    try {
      // Leave previous conversation
      if (activeConversation) {
        socketService.leaveConversation(activeConversation.id);
      }

      // Set active conversation
      setActiveConversation(conversation);

      // Join new conversation
      socketService.joinConversation(conversation.id);

      // Load messages
      const conversationMessages = await chatService.getConversationMessages(
        conversation.id
      );
      console.log("Loaded messages:", conversationMessages);
      setMessages(conversationMessages);

      scrollToBottom();
    } catch (error) {
      console.error("Error loading conversation:", error);
      setError("Failed to load conversation messages.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !activeConversation) return;

    setSending(true);
    try {
      console.log("Sending message:", newMessage);

      // Send via API
      const sentMessage = await chatService.sendMessage(
        activeConversation.id,
        user.id,
        newMessage.trim()
      );

      // Send via socket for real-time delivery
      socketService.sendMessage(activeConversation.id, sentMessage);

      // Add to local messages
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Show error state
  if (error) {
    return (
      <div className={styles.chatPage}>
        <Header />
        <div className={styles.errorContainer}>
          <div className={styles.errorMessage}>
            <h3>Connection Error</h3>
            <p>{error}</p>
            <button
              className={styles.retryButton}
              onClick={() => {
                setError(null);
                setLoading(true);
                initializeChat();
              }}
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.chatPage}>
        <Header />
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatPage}>
      <Header />

      <div className={styles.chatContainer}>
        {/* Conversations Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Conversations</h2>
            <button
              className={styles.newChatButton}
              onClick={() => setShowNewChatForm(true)}
              title="Create New Chat"
            >
              +
            </button>
          </div>

          <div className={styles.conversationsList}>
            {conversations.length === 0 ? (
              <div className={styles.noConversations}>
                <div className={styles.emptyStateIcon}>💬</div>
                <h3>No Conversations Yet</h3>
                <p>
                  You haven't joined any conversations yet. Start connecting
                  with your fellow SMU students!
                </p>
                <button
                  className={styles.createFirstChat}
                  onClick={() => setShowNewChatForm(true)}
                >
                  Start Your First Chat
                </button>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`${styles.conversationItem} ${
                    activeConversation?.id === conversation.id
                      ? styles.active
                      : ""
                  }`}
                  onClick={() => handleConversationClick(conversation)}
                >
                  <div className={styles.conversationInfo}>
                    <h4>{conversation.name}</h4>
                    <span className={styles.conversationType}>
                      {conversation.type === "direct" ? "💬" : "👥"}{" "}
                      {conversation.type}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={styles.chatArea}>
          {activeConversation ? (
            <>
              <div className={styles.chatHeader}>
                <h3>{activeConversation.name}</h3>
                <span className={styles.chatType}>
                  {activeConversation.type === "direct"
                    ? "Direct Message"
                    : "Group Chat"}
                </span>
              </div>

              <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <div className={styles.noMessages}>
                    <div className={styles.emptyMessagesIcon}>✨</div>
                    <h4>Start the Conversation!</h4>
                    <p>No messages yet. Be the first to say hello!</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={message.id || index}>
                      <div
                        className={`${styles.message} ${
                          message.user_id === user.id
                            ? styles.own
                            : styles.other
                        }`}
                      >
                        <div className={styles.messageContent}>
                          {message.user_id !== user.id && (
                            <div className={styles.senderName}>
                              {message.users?.display_name ||
                                message.users?.email ||
                                "Unknown User"}
                            </div>
                          )}
                          <div className={styles.messageText}>
                            {message.content}
                          </div>
                          <div className={styles.messageTime}>
                            {new Date(message.created_at).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className={styles.messageForm} onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className={styles.messageInput}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className={styles.sendButton}
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? "..." : "Send"}
                </button>
              </form>
            </>
          ) : conversations.length === 0 ? (
            <div className={styles.welcomeEmptyState}>
              <div className={styles.welcomeIcon}>🎓</div>
              <h2>Welcome to SMOOFriends Chat!</h2>
              <p>
                Connect with your fellow SMU students and start meaningful
                conversations.
              </p>

              <div className={styles.emptyStateFeatures}>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>💬</span>
                  <div>
                    <h4>Start Group Chats</h4>
                    <p>Create study groups, plan events, or just hang out</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🤝</span>
                  <div>
                    <h4>Meet New People</h4>
                    <p>Connect with students from different majors and years</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>📚</span>
                  <div>
                    <h4>Study Together</h4>
                    <p>Form study groups and share academic resources</p>
                  </div>
                </div>
              </div>

              <button
                className={styles.getStartedButton}
                onClick={() => setShowNewChatForm(true)}
              >
                Get Started - Create Your First Chat
              </button>
            </div>
          ) : (
            <div className={styles.noChatSelected}>
              <h3>Select a Conversation</h3>
              <p>
                Choose a conversation from the sidebar to start chatting with
                your fellow SMU students.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Form Modal */}
      {showNewChatForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Create New Chat</h3>
            <p>Start a new conversation with your SMU friends!</p>
            <form onSubmit={handleCreateChat}>
              <input
                type="text"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                placeholder="Enter chat name (e.g., 'CS Study Group', 'Weekend Plans')..."
                className={styles.chatNameInput}
                autoFocus
                disabled={creatingChat}
              />
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewChatForm(false);
                    setNewChatName("");
                  }}
                  className={styles.cancelButton}
                  disabled={creatingChat}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.createButton}
                  disabled={!newChatName.trim() || creatingChat}
                >
                  {creatingChat ? "Creating..." : "Create Chat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
