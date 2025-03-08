import { createDateRange, getDayOfWeek } from './dateUtils';
import { enforcePreExamSession } from './enforcePreExamSession';
import { getEligibleSubjects } from './getEligibleSubjects';
import { createSession } from './sessionUtils';
import { sortSessionsByBlock } from './utils/sessionSorter';
import { createExamSlotsMap, sortExamsByDate } from './utils/examUtils';
import * as Sentry from '@sentry/browser';

/**
 * Core timetable generation function
 * @param {Array} exams - Array of exam objects
 * @param {string} startDate - Start date string in YYYY-MM-DD format
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {Object} blockTimes - User block time preferences
 * @param {Function} idGenerator - Optional function to generate IDs for sessions
 * @returns {Array} Array of timetable entry objects
 */
export async function generateTimetableCore(exams, startDate, revisionTimes, blockTimes = {}, idGenerator = null) {
  try {
    // Default ID generator if none provided
    const generateId = idGenerator || (() => 
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );

    // Basic validation
    if (!exams || exams.length === 0) {
      console.warn('No upcoming exams found');
      return [];
    }

    // Check if any revision times are selected
    const hasRevisionTimes = Object.values(revisionTimes).some(
      days => days && days.length > 0
    );

    if (!hasRevisionTimes) {
      throw new Error('No revision times selected');
    }

    // Sort exams by date
    const sortedExams = sortExamsByDate(exams);

    // Find latest exam date
    const latestExamDate = sortedExams[sortedExams.length - 1].examDate;

    // Create date range from start date to latest exam date
    const dateRange = createDateRange(startDate, latestExamDate);

    // Create map of exam slots to avoid scheduling during exams
    const examSlots = createExamSlotsMap(sortedExams);

    // Track number of sessions per subject for distribution
    const subjectCounts = {};
    sortedExams.forEach(exam => {
      subjectCounts[exam.subject] = 0;
    });

    // Generate initial timetable
    const timetableEntries = [];

    // Process each date in the range
    for (const date of dateRange) {
      const dayOfWeek = getDayOfWeek(date);
      const availableBlocks = revisionTimes[dayOfWeek] || [];

      // For each available block on this day
      for (const block of availableBlocks) {
        // Skip if there's an exam in this slot
        const slotKey = `${date}-${block}`;
        if (examSlots.has(slotKey)) {
          continue;
        }

        // Get eligible subjects for this slot
        const eligibleSubjects = getEligibleSubjects(
          date,
          block,
          sortedExams,
          subjectCounts,
          examSlots
        );

        if (eligibleSubjects.length === 0) {
          continue;
        }

        // Choose subject with lowest count (prioritize subjects that need more sessions)
        const subjectsByCount = [...eligibleSubjects].sort(
          (a, b) => (subjectCounts[a] || 0) - (subjectCounts[b] || 0)
        );

        const chosenSubject = subjectsByCount[0];
        subjectCounts[chosenSubject] = (subjectCounts[chosenSubject] || 0) + 1;

        // Create session and add to timetable
        timetableEntries.push(createSession(date, block, chosenSubject, blockTimes));
      }
    }

    // Enforce pre-exam sessions for each subject
    const finalTimetable = enforcePreExamSession(
      sortedExams,
      timetableEntries,
      revisionTimes,
      startDate,
      blockTimes
    );

    // Sort the final timetable by date and block
    const sortedTimetable = sortSessionsByBlock(finalTimetable);

    return sortedTimetable;
  } catch (error) {
    console.error('Error generating timetable:', error);
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Main export for both client and server side timetable generation
 */
export async function generateTimetable(exams, startDate, revisionTimes, blockTimes) {
  return generateTimetableCore(exams, startDate, revisionTimes, blockTimes);
}