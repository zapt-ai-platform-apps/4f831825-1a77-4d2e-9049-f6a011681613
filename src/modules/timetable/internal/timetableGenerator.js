import { generateTimetableCore } from './timetableGeneratorCore';

/**
 * Generates a timetable based on exams, preferences, and available times
 * This is a simple wrapper around the core generator to maintain consistent API
 * @param {Array} exams - Array of exam objects
 * @param {string} startDate - Start date string in YYYY-MM-DD format
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {Object} blockTimes - User block time preferences
 * @returns {Array} Array of timetable entry objects
 */
export async function generateTimetable(exams, startDate, revisionTimes, blockTimes = {}) {
  return generateTimetableCore(exams, startDate, revisionTimes, blockTimes);
}