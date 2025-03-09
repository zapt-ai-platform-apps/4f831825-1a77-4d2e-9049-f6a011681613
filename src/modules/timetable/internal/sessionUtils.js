import { BLOCK_ORDER } from './constants';

/**
 * Default block times if not specified by user
 */
const DEFAULT_BLOCK_TIMES = {
  Morning: { startTime: '09:00', endTime: '13:00' },
  Afternoon: { startTime: '14:00', endTime: '17:00' },
  Evening: { startTime: '19:00', endTime: '21:00' },
};

/**
 * Creates a timetable session
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {string} subject - Subject name
 * @param {Object} blockTimes - User block time preferences (optional)
 * @param {boolean} isUserCreated - Whether the session was created by the user (optional)
 * @returns {Object} Session object
 */
export function createSession(date, block, subject, blockTimes = {}, isUserCreated = false) {
  return {
    date,
    block,
    subject,
    startTime: getBlockStartTime(block, blockTimes),
    endTime: getBlockEndTime(block, blockTimes),
    isUserCreated
  };
}

/**
 * Gets the start time for a block
 * @param {string} block - Block name
 * @param {Object} blockTimes - User block time preferences
 * @returns {string} Start time in HH:MM format
 */
export function getBlockStartTime(block, blockTimes = {}) {
  if (blockTimes && blockTimes[block] && blockTimes[block].startTime) {
    return blockTimes[block].startTime;
  }
  return DEFAULT_BLOCK_TIMES[block]?.startTime || '09:00';
}

/**
 * Gets the end time for a block
 * @param {string} block - Block name
 * @param {Object} blockTimes - User block time preferences
 * @returns {string} End time in HH:MM format
 */
export function getBlockEndTime(block, blockTimes = {}) {
  if (blockTimes && blockTimes[block] && blockTimes[block].endTime) {
    return blockTimes[block].endTime;
  }
  return DEFAULT_BLOCK_TIMES[block]?.endTime || '17:00';
}

/**
 * Calculates the duration of a block in hours
 * @param {string} block - Block name
 * @param {Object} blockTimes - User block time preferences
 * @returns {number} Duration in hours
 */
export function getBlockDuration(block, blockTimes = {}) {
  const startTime = getBlockStartTime(block, blockTimes);
  const endTime = getBlockEndTime(block, blockTimes);
  
  if (!startTime || !endTime) {
    // Default durations if times are not available
    const defaults = {
      Morning: 4,
      Afternoon: 3,
      Evening: 2
    };
    return defaults[block] || 2;
  }
  
  // Parse times
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  // Calculate duration in hours
  return (endHour + endMinute / 60) - (startHour + startMinute / 60);
}