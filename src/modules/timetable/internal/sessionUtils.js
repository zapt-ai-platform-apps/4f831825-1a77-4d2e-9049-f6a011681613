import { DEFAULT_BLOCK_TIMES } from './constants';
import { generateId } from '../../core/internal/helpers';

/**
 * Creates a timetable session object
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {string} subject - Subject name
 * @param {Object} blockTimes - User block time preferences
 * @param {boolean} isUserCreated - Whether the session was created by the user
 * @returns {Object} Session object
 */
export function createSession(date, block, subject, blockTimes = {}, isUserCreated = false) {
  if (!date) {
    console.error('createSession called without date parameter');
    throw new Error('Date is required for session creation');
  }

  return {
    date,
    block,
    subject,
    startTime: getBlockTime(block, blockTimes, 'startTime'),
    endTime: getBlockTime(block, blockTimes, 'endTime'),
    isUserCreated
  };
}

/**
 * Gets the start or end time for a block based on user preferences or defaults
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {Object} blockTimes - User block time preferences
 * @param {string} timeType - 'startTime' or 'endTime'
 * @returns {string} Time string in HH:MM format
 */
function getBlockTime(block, blockTimes, timeType) {
  // If user has specified block times, use those
  if (blockTimes && blockTimes[block] && blockTimes[block][timeType]) {
    return blockTimes[block][timeType];
  }
  
  // Otherwise, use defaults from constants
  return DEFAULT_BLOCK_TIMES[block]?.[timeType] || 
    (timeType === 'startTime' ? '09:00' : '12:00'); // Fallback defaults
}