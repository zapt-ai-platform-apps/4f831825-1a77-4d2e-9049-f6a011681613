import { BLOCK_ORDER } from './constants';

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
    throw new Error('Date is required for creating a session');
  }
  
  if (!block) {
    console.error('createSession called without block parameter');
    throw new Error('Block is required for creating a session');
  }
  
  const blockTime = blockTimes[block] || {};
  
  return {
    date,
    block,
    subject,
    startTime: blockTime.startTime || getDefaultStartTime(block),
    endTime: blockTime.endTime || getDefaultEndTime(block),
    isUserCreated: Boolean(isUserCreated)
  };
}

/**
 * Gets the default start time for a block
 * @param {string} block - Block name
 * @returns {string} Time string in HH:MM format
 */
function getDefaultStartTime(block) {
  const defaults = {
    Morning: '09:00',
    Afternoon: '14:00',
    Evening: '19:00'
  };
  
  return defaults[block] || '09:00';
}

/**
 * Gets the default end time for a block
 * @param {string} block - Block name
 * @returns {string} Time string in HH:MM format
 */
function getDefaultEndTime(block) {
  const defaults = {
    Morning: '13:00',
    Afternoon: '17:00',
    Evening: '21:00'
  };
  
  return defaults[block] || '12:00';
}