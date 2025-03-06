import { parseISO, isAfter } from 'date-fns';
import { BLOCK_ORDER, DEFAULT_BLOCK_TIMES } from './constants';

/**
 * Gets a time string for a session based on block and user preferences
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {Object} blockTimes - User block time preferences
 * @param {string} timeType - Type of time to get ('startTime' or 'endTime')
 * @returns {string} Time string in HH:MM format
 */
export function getSessionTime(block, blockTimes, timeType) {
  if (blockTimes && blockTimes[block] && blockTimes[block][timeType]) {
    return blockTimes[block][timeType];
  }
  
  // Return default time if no user preference is available
  return DEFAULT_BLOCK_TIMES[block][timeType];
}

/**
 * Sorts sessions by block order (Morning, Afternoon, Evening)
 * @param {Array} sessions - Array of session objects
 * @returns {Array} Sorted sessions
 */
export function sortSessionsByBlock(sessions) {
  return [...sessions].sort((a, b) => {
    return BLOCK_ORDER[a.block] - BLOCK_ORDER[b.block];
  });
}

/**
 * Filters out sessions that are scheduled after a subject's exam date
 * @param {Array} sessions - Array of timetable sessions
 * @param {Array} exams - Array of exam objects
 * @returns {Array} Filtered sessions
 */
export function filterSessionsAfterExams(sessions, exams) {
  // Create a map of subjects to exam dates
  const subjectExamDates = {};
  exams.forEach(exam => {
    if (!subjectExamDates[exam.subject] || 
        isAfter(parseISO(subjectExamDates[exam.subject]), parseISO(exam.examDate))) {
      subjectExamDates[exam.subject] = exam.examDate;
    }
  });
  
  // Filter out sessions after the subject's exam date
  return sessions.filter(session => {
    const examDate = subjectExamDates[session.subject];
    if (!examDate) return true;
    
    return !isAfter(parseISO(session.date), parseISO(examDate));
  });
}

/**
 * Creates session objects for each date, block, and subject
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {string} subject - Subject name
 * @param {Object} blockTimes - User block time preferences
 * @returns {Object} Session object
 */
export function createSession(date, block, subject, blockTimes) {
  return {
    date,
    block,
    subject,
    startTime: getSessionTime(block, blockTimes, 'startTime'),
    endTime: getSessionTime(block, blockTimes, 'endTime'),
    isUserCreated: false
  };
}