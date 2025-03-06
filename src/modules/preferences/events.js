/**
 * Preferences-specific events
 */
export const events = {
  UPDATED: 'preferences/updated',
  SAVED: 'preferences/saved',
  ERROR: 'preferences/error'
};

/**
 * Map of event names to human-readable descriptions
 */
export const eventDescriptions = {
  [events.UPDATED]: 'Preferences updated',
  [events.SAVED]: 'Preferences saved',
  [events.ERROR]: 'Preferences error occurred'
};