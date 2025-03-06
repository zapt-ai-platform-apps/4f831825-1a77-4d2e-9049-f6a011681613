import { DEFAULT_BLOCK_TIMES } from './constants';

/**
 * Creates a session object
 * @param {string} date - Session date in YYYY-MM-DD format
 * @param {string} block - Session block (Morning, Afternoon, Evening)
 * @param {string} subject - Subject name
 * @param {Object} blockTimes - Block time preferences
 * @param {boolean} isUserCreated - Whether the session was created by the user
 * @returns {Object} Session object
 */
export function createSession(date, block, subject, blockTimes, isUserCreated = false) {
  // Get block times from preferences or use defaults
  const times = blockTimes && blockTimes[block] 
    ? blockTimes[block] 
    : DEFAULT_BLOCK_TIMES[block] || { startTime: '', endTime: '' };
  
  return {
    date,
    block,
    subject,
    startTime: times.startTime,
    endTime: times.endTime,
    isUserCreated
  };
}