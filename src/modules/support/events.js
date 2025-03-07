/**
 * Support-specific events
 */
export const events = {
  CHAT_CONNECTED: 'support/chat_connected',
  CHAT_DISCONNECTED: 'support/chat_disconnected',
  MESSAGE_RECEIVED: 'support/message_received',
  MESSAGE_SENT: 'support/message_sent'
};

/**
 * Map of event names to human-readable descriptions
 */
export const eventDescriptions = {
  [events.CHAT_CONNECTED]: 'Support chat connected',
  [events.CHAT_DISCONNECTED]: 'Support chat disconnected',
  [events.MESSAGE_RECEIVED]: 'Support message received',
  [events.MESSAGE_SENT]: 'Support message sent'
};