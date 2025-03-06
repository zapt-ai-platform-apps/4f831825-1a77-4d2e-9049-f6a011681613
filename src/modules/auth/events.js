/**
 * Authentication-specific events
 */
export const events = {
  SIGNED_IN: 'auth/signed_in',
  SIGNED_OUT: 'auth/signed_out',
  SESSION_REFRESHED: 'auth/session_refreshed',
  SESSION_EXPIRED: 'auth/session_expired'
};

/**
 * Map of event names to human-readable descriptions
 */
export const eventDescriptions = {
  [events.SIGNED_IN]: 'User signed in',
  [events.SIGNED_OUT]: 'User signed out',
  [events.SESSION_REFRESHED]: 'Session refreshed',
  [events.SESSION_EXPIRED]: 'Session expired'
};