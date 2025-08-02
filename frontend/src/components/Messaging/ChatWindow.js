// src/Components/ChatWindow.js - Updated with Clear Chat feature

import React, { useState } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { sendPrivateMessage } from '../..socket.js';

/**
 * @param {Object} props
 * @param {Object} props.user - The user you're chatting with (e.g. { uid, name })
 * @param {Array} props.messages - Array of messages exchanged with this user
 * @param {Function} props.onSend - Function to update message state in App.js
 * @param {Function} props.onRetryMessage - Function to retry failed messages
 * @param {Function} props.onClearChat - Function to clear all messages
 */
function ChatWindow({ user, messages, onSend, onRetryMessage, onClearChat }) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // If no user is selected, show a placeholder
  if (!user) return <div style={{ padding: '20px' }}>Select someone to chat with</div>;

  // Called when user sends a new message
  const handleSend = (text) => {
    onSend(user.uid, text);
  };

  // Handle retrying a failed message
  const handleRetryMessage = (message) => {
    if (onRetryMessage) {
      onRetryMessage(message);
    }
  };

  // Handle clear chat confirmation
  const handleClearChat = () => {
    if (onClearChat) {
      onClearChat(user.uid);
    }
    setShowClearConfirm(false);
  };

  return (
    <div style={{ 
      flex: 1, 
      padding: '10px', 
      display: 'flex', 
      flexDirection: 'column',
      height: '100%'
    }}>
      {/* Header with chat title and clear button */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px',
        paddingBottom: '8px',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <h3 style={{ margin: '0' }}>Chat with {user.name}</h3>
        
        {/* Clear Chat Button */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {messages.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
              title="Clear all messages"
            >
              🗑️ Clear Chat
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
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
            <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>
              Clear Chat History?
            </h4>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>
              This will permanently delete all messages in this conversation. 
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowClearConfirm(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Messages Area */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        marginBottom: '10px', 
        border: '1px solid #ccc', 
        padding: '10px',
        borderRadius: '8px',
        backgroundColor: '#f8f9fa'
      }}>
        {messages.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            marginTop: '50px',
            fontSize: '14px'
          }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, index) => (
            <MessageBubble
              key={msg.id || index}
              message={msg.message}
              fromSelf={msg.from === 'me'}
              timestamp={msg.timestamp}
              status={msg.status}
              edited={msg.edited}
              onRetry={() => handleRetryMessage(msg)}
            />
          ))
        )}
      </div>
      
      <MessageInput onSend={handleSend} />
    </div>
  );
}

export default ChatWindow;
