import { parseISO, isBefore, isAfter, format } from 'date-fns';
import { createSession } from './sessionUtils';
import { generateId } from '../../core/internal/helpers';

/**
 * Builds a timetable session object
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {string} subject - Subject name
 * @param {Object} blockTimes - User block time preferences
 * @param {boolean} isUserCreated - Whether the session was created by the user
 * @returns {Object} Session object
 */
export function buildTimetableSession(date, block, subject, blockTimes, isUserCreated = false) {
  return {
    id: generateId(),
    date,
    block,
    subject,
    startTime: getBlockTime(block, blockTimes, 'startTime'),
    endTime: getBlockTime(block, blockTimes, 'endTime'),
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
function getBlockTime(block, blockTimes, timeType) {
  if (blockTimes && blockTimes[block] && blockTimes[block][timeType]) {
    return blockTimes[block][timeType];
  }
  
  // Default times if not specified
  const defaults = {
    Morning: { startTime: '09:00', endTime: '13:00' },
    Afternoon: { startTime: '14:00', endTime: '17:00' },
    Evening: { startTime: '19:00', endTime: '21:00' }
  };
  
  return defaults[block][timeType];
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
      sessions.push(buildTimetableSession(dateStr, block, subject, blockTimes));
    });
    
    currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
  }
  
  return sessions;
}