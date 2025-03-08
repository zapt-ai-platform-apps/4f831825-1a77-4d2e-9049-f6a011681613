import { DEFAULT_BLOCK_TIMES } from './constants';
import { generateId } from '../../core/internal/helpers';
import { parseISO, format } from 'date-fns';

/**
 * Creates a session object with all required properties
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {string} subject - Subject name
 * @param {Object} blockTimes - User block time preferences
 * @param {boolean} isUserCreated - Whether session was created by user
 * @returns {Object} Session object
 */
export function createSession(date, block, subject, blockTimes = {}, isUserCreated = false) {
  // Get start and end times for this block
  const blockTime = blockTimes[block] || DEFAULT_BLOCK_TIMES[block] || {};
  
  return {
    id: generateId(),
    date,
    block,
    subject,
    startTime: blockTime.startTime || DEFAULT_BLOCK_TIMES[block]?.startTime || null,
    endTime: blockTime.endTime || DEFAULT_BLOCK_TIMES[block]?.endTime || null,
    isUserCreated
  };
}

/**
 * Gets the start or end time for a block
 * @param {string} block - Block name
 * @param {Object} blockTimes - User block time preferences
 * @param {string} timeType - 'startTime' or 'endTime'
 * @returns {string} Time string in HH:MM format
 */
export function getBlockTime(block, blockTimes, timeType) {
  if (blockTimes && blockTimes[block] && blockTimes[block][timeType]) {
    return blockTimes[block][timeType];
  }
  
  return DEFAULT_BLOCK_TIMES[block]?.[timeType];
}

/**
 * Builds timetable sessions for a specific subject and date range
 * @param {string} subject - Subject name
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {Array} availableBlocks - Available blocks for each day
 * @param {Object} blockTimes - User block time preferences
 * @returns {Array} Array of session objects
 */
export function buildSubjectSessions(subject, startDate, endDate, availableBlocks, blockTimes) {
  const sessions = [];
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  let currentDate = start;
  while (!isAfter(currentDate, end)) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayOfWeek = format(currentDate, 'EEEE').toLowerCase();
    const blocks = availableBlocks[dayOfWeek] || [];
    
    blocks.forEach(block => {
      sessions.push(createSession(dateStr, block, subject, blockTimes));
    });
    
    // Add one day to currentDate
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  }
  
  return sessions;
}