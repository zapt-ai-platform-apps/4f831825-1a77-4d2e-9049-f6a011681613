import { DEFAULT_BLOCK_TIMES } from './constants';

/**
 * Creates a session object with all required properties
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {string} subject - Subject name
 * @param {Object} blockTimes - User block time preferences
 * @returns {Object} Session object
 */
export function createSession(date, block, subject, blockTimes = {}) {
  // Get start and end times for this block
  const blockTime = blockTimes[block] || DEFAULT_BLOCK_TIMES[block] || {};
  
  return {
    date, // Ensure date is included
    block,
    subject,
    startTime: blockTime.startTime || DEFAULT_BLOCK_TIMES[block]?.startTime || null,
    endTime: blockTime.endTime || DEFAULT_BLOCK_TIMES[block]?.endTime || null,
    isUserCreated: false
  };
}