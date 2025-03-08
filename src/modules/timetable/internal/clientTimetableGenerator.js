import { generateTimetableCore } from './timetableGeneratorCore';
import * as Sentry from '@sentry/browser';

/**
 * Client-side timetable generator
 * @param {Array} exams - Array of exam objects
 * @param {string} startDate - Start date string in YYYY-MM-DD format
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {Object} blockTimes - User block time preferences
 * @returns {Array} Array of timetable entry objects
 */
export async function generateTimetableClient(exams, startDate, revisionTimes, blockTimes) {
  try {
    return await generateTimetableCore(
      exams, 
      startDate, 
      revisionTimes, 
      blockTimes, 
      () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  } catch (error) {
    console.error("Error in generateTimetableClient:", error);
    Sentry.captureException(error);
    throw error;
  }
}