/**
 * Exams-specific events
 */
export const events = {
  CREATED: 'exams/created',
  UPDATED: 'exams/updated',
  DELETED: 'exams/deleted',
  LOADED: 'exams/loaded',
  ERROR: 'exams/error'
};

/**
 * Map of event names to human-readable descriptions
 */
export const eventDescriptions = {
  [events.CREATED]: 'Exam created',
  [events.UPDATED]: 'Exam updated',
  [events.DELETED]: 'Exam deleted',
  [events.LOADED]: 'Exams loaded',
  [events.ERROR]: 'Exams error occurred'
};