import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Header from "../Header/Header";
import styles from "./Chat.module.css";

// Import our chat utilities
import { ChatAPI } from "../../services/chatAPI";
import { ChatStorage } from "../../utils/chatStorage";
import { 
  sendPrivateMessage, 
  initializeSocket, 
  onPrivateMessage, 
  offPrivateMessage,
  getSocket,
  disconnectSocket
} from "../../socket/socket";

// User configuration
const ALICE_USER = {
  uid: '550e8400-e29b-41d4-a716-446655440001',
  name: 'Alice (SOE, Yr 2)',
  email: 'alice.smith.2023@student.smu.edu.sg'
};

const TERRY_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [newChatName, setNewChatName] = useState("");
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
      // Cleanup socket connection - FIXED
      offPrivateMessage();
      disconnectSocket();
    };
  }, [user]);

  const initializeChat = async () => {
    try {
      console.log("Initializing chat for user:", user.id);
      setLoading(true);

      // Initialize socket connection with user ID
      const socket = initializeSocket(TERRY_USER_ID);
      
      // Set up connection status handlers
      socket.on('connect', () => {
        console.log('✅ Socket connected');
        setConnectionStatus('connected');
      });

      socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setConnectionStatus('disconnected');
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionStatus('error');
      });

      // Set up incoming message listener
      const handleIncomingMessage = (data) => {
        console.log('📨 Received message:', data);
        
        const incomingMessage = {
          id: data.id || crypto.randomUUID(),
          user_id: data.from,
          content: data.message,
          created_at: data.timestamp || new Date().toISOString(),
          users: {
            display_name: data.from === ALICE_USER.uid ? ALICE_USER.name : 'Unknown User'
          }
        };

        // Add to current messages if it's for the active conversation
        if (activeConversation && activeConversation.other_user_id === data.from) {
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === incomingMessage.id);
            if (exists) return prev;
            
            const newMessages = [...prev, incomingMessage];
            
            // Save to local storage
            ChatStorage.saveConversation(TERRY_USER_ID, data.from, 
              newMessages.map(msg => ({
                id: msg.id,
                from: msg.user_id,
                to: msg.user_id === TERRY_USER_ID ? data.from : TERRY_USER_ID,
                message: msg.content,
                timestamp: msg.created_at,
                status: 'received'
              }))
            );
            
            return newMessages;
          });
          
          scrollToBottom();
        }

        // Save to server
        ChatAPI.saveIncomingMessage(incomingMessage).catch(err => 
          console.warn('Could not save incoming message to server:', err)
        );
      };

      onPrivateMessage(handleIncomingMessage);

      // Create/load Alice conversation
      await loadAliceConversation();

      setLoading(false);

    } catch (error) {
      console.error("Error initializing chat:", error);
      setError("Failed to connect to chat service. Please check your connection.");
      setLoading(false);
    }
  };

  const loadAliceConversation = async () => {
    try {
      console.log("🔄 Loading Alice conversation...");
      
      // Create the Alice conversation object
      const aliceConversation = {
        id: `conversation_${TERRY_USER_ID}_${ALICE_USER.uid}`,
        name: ALICE_USER.name,
        type: 'direct',
        other_user_id: ALICE_USER.uid,
        other_user_name: ALICE_USER.name,
        other_user_email: ALICE_USER.email
      };

      // Set conversations (just Alice for now)
      setConversations([aliceConversation]);
      console.log("✅ Alice conversation created");

      // Auto-select Alice conversation
      setActiveConversation(aliceConversation);
      console.log("✅ Alice conversation selected");

      // Load messages from local storage first
      const localMessages = ChatStorage.getConversation(TERRY_USER_ID, ALICE_USER.uid);
      console.log(`📱 Found ${localMessages.length} local messages`);
      
      // Convert storage format to component format
      const formattedLocalMessages = localMessages.map(msg => ({
        id: msg.id,
        user_id: msg.from === 'me' ? TERRY_USER_ID : msg.from,
        content: msg.message,
        created_at: msg.timestamp,
        users: {
          display_name: msg.from === 'me' ? 'You' : 
                      msg.from === ALICE_USER.uid ? ALICE_USER.name : 'Unknown User'
        }
      }));

      if (formattedLocalMessages.length > 0) {
        setMessages(formattedLocalMessages);
        console.log(`📱 Loaded ${formattedLocalMessages.length} messages from local storage`);
      }

      // Try to sync with server
      try {
        console.log("🌐 Syncing with server...");
        const serverMessages = await ChatAPI.getConversation(TERRY_USER_ID, ALICE_USER.uid);
        console.log(`🌐 Server returned ${serverMessages.length} messages`);
        
        // Convert server format to component format
        const formattedServerMessages = serverMessages.map(msg => ({
          id: msg.id,
          user_id: msg.from,
          content: msg.message,
          created_at: msg.timestamp,
          users: {
            display_name: msg.from === TERRY_USER_ID ? 'You' : 
                        msg.from === ALICE_USER.uid ? ALICE_USER.name : 'Unknown User'
          }
        }));

        // Merge and deduplicate
        const mergedMessages = mergeMessages(formattedLocalMessages, formattedServerMessages);
        
        if (mergedMessages.length !== formattedLocalMessages.length) {
          setMessages(mergedMessages);
          
          // Save merged messages back to storage
          const storageFormat = mergedMessages.map(msg => ({
            id: msg.id,
            from: msg.user_id === TERRY_USER_ID ? 'me' : msg.user_id,
            to: msg.user_id === TERRY_USER_ID ? ALICE_USER.uid : TERRY_USER_ID,
            message: msg.content,
            timestamp: msg.created_at,
            status: 'sent'
          }));
          
          ChatStorage.saveConversation(TERRY_USER_ID, ALICE_USER.uid, storageFormat);
          console.log(`🔄 Synced with server: ${mergedMessages.length} total messages`);
        }
      } catch (serverError) {
        console.warn('⚠️ Could not sync with server, using local messages only:', serverError);
      }

      scrollToBottom();

    } catch (error) {
      console.error('Error loading Alice conversation:', error);
      setError('Failed to load conversation with Alice.');
    }
  };

  const createAliceChat = () => {
    console.log("🆕 Creating Alice chat manually...");
    loadAliceConversation();
  };

  const handleCreateCustomChat = (e) => {
    e.preventDefault();
    if (!newChatName.trim()) return;

    // For now, we'll just show an alert since this is beyond Alice
    alert(`Creating chat with "${newChatName}" - This feature will be implemented soon!`);
    setNewChatName("");
    setShowNewChatForm(false);
  };

  const mergeMessages = (localMessages, serverMessages) => {
    const allMessages = [...localMessages, ...serverMessages];
    const uniqueMessages = [];
    const seenIds = new Set();

    allMessages.forEach(msg => {
      if (!seenIds.has(msg.id)) {
        seenIds.add(msg.id);
        uniqueMessages.push(msg);
      }
    });

    return uniqueMessages.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !activeConversation) return;

    setSending(true);
    const messageId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    // Create message object
    const messageData = {
      id: messageId,
      user_id: TERRY_USER_ID,
      content: newMessage.trim(),
      created_at: timestamp,
      users: {
        display_name: 'You'
      }
    };

    try {
      console.log("Sending message:", newMessage);

      // Add to local messages immediately
      const updatedMessages = [...messages, messageData];
      setMessages(updatedMessages);
      setNewMessage("");
      scrollToBottom();

      // Save to local storage
      const storageFormat = updatedMessages.map(msg => ({
        id: msg.id,
        from: msg.user_id === TERRY_USER_ID ? 'me' : msg.user_id,
        to: msg.user_id === TERRY_USER_ID ? ALICE_USER.uid : TERRY_USER_ID,
        message: msg.content,
        timestamp: msg.created_at,
        status: 'sent'
      }));
      
      ChatStorage.saveConversation(TERRY_USER_ID, ALICE_USER.uid, storageFormat);

      // Send via socket - FIXED: proper message format
      const socketMessageData = {
        to: ALICE_USER.uid,
        message: messageData.content,
        from: TERRY_USER_ID,
        timestamp: timestamp,
        id: messageId
      };
      
      sendPrivateMessage(socketMessageData);

      // Send to server API
      await ChatAPI.sendMessage({
        id: messageId,
        from: TERRY_USER_ID,
        to: ALICE_USER.uid,
        message: messageData.content,
        timestamp: timestamp,
      });

      console.log('✅ Message sent and saved successfully');

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

  // Clear chat function
  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear all messages? This cannot be undone.')) {
      return;
    }

    try {
      // Clear from local storage
      ChatStorage.clearConversation(TERRY_USER_ID, ALICE_USER.uid);
      
      // Clear from state
      setMessages([]);
      
      // Clear from server
      try {
        await ChatAPI.clearConversation(TERRY_USER_ID, ALICE_USER.uid);
        console.log('✅ Chat cleared from server');
      } catch (serverError) {
        console.warn('⚠️ Could not clear chat from server:', serverError);
      }
      
      console.log('✅ Chat cleared successfully');
      
    } catch (error) {
      console.error('❌ Error clearing chat:', error);
      setError('Failed to clear chat.');
    }
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
          <p>Loading conversation with Alice...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatPage}>
      <Header />

      {/* Connection status */}
      <div style={{
        padding: '4px 8px',
        backgroundColor: connectionStatus === 'connected' ? '#d4edda' : '#f8d7da',
        color: connectionStatus === 'connected' ? '#155724' : '#721c24',
        fontSize: '12px',
        textAlign: 'center'
      }}>
        {connectionStatus === 'connected' ? '🟢 Connected' : 
         connectionStatus === 'error' ? '🔴 Connection Error' : '🟡 Connecting...'}
      </div>

      <div className={styles.chatContainer}>
        {/* Conversations Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>Conversations</h2>
            <button
              className={styles.newChatButton}
              onClick={() => setShowNewChatForm(true)}
              title="Add New Chat"
            >
              +
            </button>
          </div>

          <div className={styles.conversationsList}>
            {conversations.length === 0 ? (
              <div className={styles.noConversations || styles.noMessages}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                  <h3>No Conversations Yet</h3>
                  <p style={{ color: '#666', marginBottom: '20px' }}>
                    Start chatting with Alice!
                  </p>
                  <button
                    onClick={createAliceChat}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Chat with Alice
                  </button>
                </div>
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
                  onClick={() => setActiveConversation(conversation)}
                >
                  <div className={styles.conversationInfo}>
                    <h4>{conversation.name}</h4>
                    <span className={styles.conversationType}>
                      💬 Direct Message
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
                <div>
                  <h3>Chat with {activeConversation.name}</h3>
                  <span className={styles.chatType}>Direct Message</span>
                </div>
                
                {/* Clear Chat Button - Inside chat header */}
                <button
                  onClick={handleClearChat}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  title="Clear all messages"
                >
                  🗑️ Clear Chat
                </button>
              </div>

              <div className={styles.messagesContainer}>
                {messages.length === 0 ? (
                  <div className={styles.noMessages}>
                    <div className={styles.emptyMessagesIcon}>✨</div>
                    <h4>Start the Conversation!</h4>
                    <p>No messages yet. Say hello to Alice!</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={message.id || index}>
                      <div
                        className={`${styles.message} ${
                          message.user_id === TERRY_USER_ID
                            ? styles.own
                            : styles.other
                        }`}
                      >
                        <div className={styles.messageContent}>
                          {message.user_id !== TERRY_USER_ID && (
                            <div className={styles.senderName}>
                              {message.users?.display_name || "Alice"}
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
                  placeholder="Type your message to Alice..."
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
          ) : (
            <div className={styles.noChatSelected}>
              <h3>Welcome back, Terry!</h3>
              <p>
                Click the "+" button to start a chat with Alice, or select an existing conversation.
              </p>
              <button
                onClick={createAliceChat}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginTop: '20px'
                }}
              >
                💬 Start Chat with Alice
              </button>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Form Modal */}
      {showNewChatForm && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          bottom: '0',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>Start New Chat</h3>
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={() => {
                  setShowNewChatForm(false);
                  createAliceChat();
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginBottom: '12px'
                }}
              >
                💬 Chat with Alice (SOE, Yr 2)
              </button>
              
              <p style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                Or enter a custom chat name:
              </p>
              
              <form onSubmit={handleCreateCustomChat}>
                <input
                  type="text"
                  value={newChatName}
                  onChange={(e) => setNewChatName(e.target.value)}
                  placeholder="Enter chat name..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    marginBottom: '12px'
                  }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewChatForm(false);
                      setNewChatName("");
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newChatName.trim()}
                    style={{
                      flex: 1,
                      padding: '8px 16px',
                      backgroundColor: newChatName.trim() ? '#28a745' : '#ccc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: newChatName.trim() ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
