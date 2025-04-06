import { generateTimetableCore } from './timetableGeneratorCore';
import { captureTimetableError } from './errorUtils';

/**
 * Wrapper for timetable generation that includes error handling
 * @param {Array} exams - Array of exam objects
 * @param {string} startDate - Start date string in YYYY-MM-DD format
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {Object} blockTimes - User block time preferences
 * @returns {Promise<Array>} Generated timetable entries
 */
export async function generateTimetable(exams, startDate, revisionTimes, blockTimes = {}) {
  try {
    return await generateTimetableCore(exams, startDate, revisionTimes, blockTimes);
  } catch (error) {
    // Enhanced error handling with full context
    captureTimetableError(error, {
      exams,
      startDate,
      revisionTimes,
      blockTimes,
      location: 'timetableGenerator.js'
    });
    
    throw error;
  }
}