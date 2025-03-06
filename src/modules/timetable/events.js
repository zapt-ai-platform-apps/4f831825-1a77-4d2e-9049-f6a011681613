/**
 * Timetable-specific events
 */
export const events = {
  GENERATED: 'timetable/generated',
  UPDATED: 'timetable/updated',
  LOADED: 'timetable/loaded',
  ERROR: 'timetable/error'
};

/**
 * Map of event names to human-readable descriptions
 */
export const eventDescriptions = {
  [events.GENERATED]: 'Timetable generated',
  [events.UPDATED]: 'Timetable updated',
  [events.LOADED]: 'Timetable loaded',
  [events.ERROR]: 'Timetable error occurred'
};