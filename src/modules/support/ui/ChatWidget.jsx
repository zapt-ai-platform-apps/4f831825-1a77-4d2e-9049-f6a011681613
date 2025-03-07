import React, { useState, useEffect, useRef } from 'react';
import {
  Chat,
  Channel,
  Window,
  MessageList,
  MessageInput,
} from 'stream-chat-react';
import { useChatClient } from '../internal/useChatClient';
import { useAuth } from '../../auth/ui/useAuth';
import * as Sentry from '@sentry/browser';

import 'stream-chat-react/dist/css/v2/index.css';

/**
 * Loading indicator component for chat connection
 */
function ChatLoading() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin" />
      <span className="text-sm font-medium">Connecting...</span>
    </div>
  );
}

/**
 * Custom channel header component
 */
function CustomChannelHeader() {
  return (
    <div style={{ 
      padding: '12px', 
      borderBottom: '1px solid #e0e0e0',
      backgroundColor: '#0072CE',
      color: 'white',
      fontWeight: 'bold',
    }}>
      <h3 style={{ margin: 0 }}>Customer Support Chat</h3>
    </div>
  );
}

/**
 * Chat widget component for customer support
 */
function ChatWidget() {
  const { user } = useAuth();
  const { client, channel, connecting, error, connectChat, disconnectChat } = useChatClient();
  const [isOpen, setIsOpen] = useState(false);
  const chatContainerRef = useRef(null);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error('Chat error:', error);
      Sentry.captureException(new Error(`Chat connection error: ${error}`));
    }
  }, [error]);

  // Don't render anything if no user is logged in
  if (!user) {
    return null;
  }

  /**
   * Toggle chat open/closed
   */
  const toggleChat = async () => {
    if (!isOpen) {
      try {
        // Only connect if not already connected
        if (!client || !channel) {
          await connectChat();
        }
        setIsOpen(true);
      } catch (err) {
        console.error('Error toggling chat:', err);
        Sentry.captureException(err);
      }
    } else {
      setIsOpen(false);
      // Don't disconnect right away to preserve chat history during the current session
    }
  };

  /**
   * Get button style based on state
   */
  const buttonStyle = connecting
    ? {
        backgroundColor: '#FF6B6B',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 16px',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      }
    : {
        backgroundColor: '#4ECDC4',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '56px',
        height: '56px',
        fontSize: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      };

  return (
    <div className="fixed bottom-4 right-4 z-50 chat-widget">
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="btn-primary cursor-pointer transition-all duration-300 hover:shadow-lg"
        style={buttonStyle}
        disabled={connecting}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
      >
        {connecting ? <ChatLoading /> : (isOpen ? '✕' : '💬')}
      </button>
      
      {/* Chat container */}
      {isOpen && client && channel && (
        <div 
          ref={chatContainerRef}
          className="chat-container"
          style={{
            position: 'absolute',
            bottom: '70px',
            right: '0',
            width: '350px',
            height: '500px',
            backgroundColor: 'white',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Chat client={client} theme="messaging light">
            <Channel channel={channel}>
              <Window>
                <CustomChannelHeader />
                <MessageList />
                <MessageInput placeholder="Type your message here..." />
              </Window>
            </Channel>
          </Chat>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div 
          className="absolute bottom-20 right-0 bg-red-500 text-white p-3 rounded-lg shadow-lg"
          style={{ maxWidth: '250px' }}
        >
          <p className="text-sm">Failed to connect to support: {error}</p>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;