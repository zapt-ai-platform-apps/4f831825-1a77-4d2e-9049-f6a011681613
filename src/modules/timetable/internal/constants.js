/**
 * Time block constants used throughout the timetable module
 */
export const BLOCKS = ['Morning', 'Afternoon', 'Evening'];

/**
 * Days of week constants (lowercase for DB compatibility)
 */
export const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * Block order for sorting
 */
export const BLOCK_ORDER = { Morning: 0, Afternoon: 1, Evening: 2 };

/**
 * Default block times if not specified by user
 */
export const DEFAULT_BLOCK_TIMES = {
  Morning: { startTime: '09:00', endTime: '13:00' },
  Afternoon: { startTime: '14:00', endTime: '17:00' },
  Evening: { startTime: '19:00', endTime: '21:00' },
};

/**
 * Session durations in hours
 */
export const SESSION_DURATIONS = {
  Morning: 4,
  Afternoon: 3,
  Evening: 2,
};