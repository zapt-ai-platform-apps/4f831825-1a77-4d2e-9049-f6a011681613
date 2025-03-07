import { useState } from 'react';
import { StreamChat } from 'stream-chat';
import { useAuth } from '../../auth/ui/useAuth';
import { api } from '../api';
import * as Sentry from '@sentry/browser';
import { eventBus } from '../../core/events';
import { events } from '../events';

/**
 * Hook for managing Stream Chat client connection
 * @returns {Object} Chat client state and methods
 */
export function useChatClient() {
  const { session } = useAuth();
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Connect to chat service
   */
  const connectChat = async () => {
    try {
      setConnecting(true);
      setError(null);
      
      const userEmail = session?.user?.email;
      if (!userEmail) {
        throw new Error('No user session available for chat connection');
      }
      
      // Initialize customer support through API
      const supportData = await api.initializeCustomerSupport(userEmail);
      const { token, channelId, userId, VITE_PUBLIC_STREAM_KEY } = supportData;
      
      // Initialize Stream client
      const streamClient = StreamChat.getInstance(VITE_PUBLIC_STREAM_KEY);
      
      // Connect user
      await streamClient.connectUser(
        { id: userId, name: userEmail },
        token
      );
      
      // Initialize channel
      const streamChannel = streamClient.channel('messaging', channelId);
      await streamChannel.watch();
      
      setClient(streamClient);
      setChannel(streamChannel);
      
      // Publish connected event
      eventBus.publish(events.CHAT_CONNECTED, { userId, channelId });
      
      console.log('Successfully connected to support chat');
    } catch (error) {
      console.error('Error connecting to chat:', error);
      Sentry.captureException(error);
      setError(error.message);
    } finally {
      setConnecting(false);
    }
  };

  /**
   * Disconnect from chat service
   */
  const disconnectChat = async () => {
    try {
      if (client) {
        await client.disconnectUser();
        setClient(null);
        setChannel(null);
        
        // Publish disconnected event
        eventBus.publish(events.CHAT_DISCONNECTED, {});
        
        console.log('Disconnected from support chat');
      }
    } catch (error) {
      console.error('Error disconnecting from chat:', error);
      Sentry.captureException(error);
    }
  };

  return {
    client,
    channel,
    connecting,
    error,
    connectChat,
    disconnectChat
  };
}