import { generateTimetableCore } from './timetableGeneratorCore';
import { generateId } from '../../core/internal/helpers';
import * as Sentry from '@sentry/browser';

/**
 * Server-side timetable generator function
 * @param {Array} exams - Array of exam objects
 * @param {string} startDate - Start date string in YYYY-MM-DD format
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {Object} blockTimes - User block time preferences
 * @returns {Array} Array of timetable entry objects
 */
export async function generateTimetable(exams, startDate, revisionTimes, blockTimes) {
  try {
    return await generateTimetableCore(
      exams, 
      startDate, 
      revisionTimes, 
      blockTimes, 
      generateId
    );
  } catch (error) {
    console.error("Error in generateTimetable:", error);
    Sentry.captureException(error);
    throw error;
  }
}