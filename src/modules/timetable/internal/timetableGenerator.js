import { parseISO, isValid, isBefore } from 'date-fns';
import { generateTimetableCore } from './timetableGeneratorCore';
import { captureTimetableError } from './errorUtils';

/**
 * Wrapper function for generating a timetable
 * Includes validation and error handling
 * 
 * @param {Array} exams - Array of exam objects
 * @param {string} startDate - Start date string in YYYY-MM-DD format
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {Object} blockTimes - User block time preferences
 * @returns {Promise<Array>} Generated timetable entries
 */
export async function generateTimetable(exams, startDate, revisionTimes, blockTimes = {}) {
  try {
    console.log('Generating timetable with start date:', startDate);
    
    // Perform start date validation
    const parsedStartDate = parseISO(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    
    if (!isValid(parsedStartDate)) {
      throw new Error('Invalid start date format');
    }
    
    if (isBefore(parsedStartDate, today)) {
      throw new Error('Start date cannot be in the past');
    }
    
    // If validation passes, generate the timetable
    return await generateTimetableCore(exams, startDate, revisionTimes, blockTimes);
  } catch (error) {
    // Enhanced error logging with context
    captureTimetableError(error, {
      exams,
      startDate,
      revisionTimes,
      blockTimes,
      location: 'timetable/internal/timetableGenerator.js'
    });
    console.error('Error generating timetable:', error);
    throw error;
  }
}