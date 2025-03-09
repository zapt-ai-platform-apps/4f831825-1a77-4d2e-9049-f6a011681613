import { createDateRange, getDayOfWeek } from './dateUtils';
import { enforcePreExamSession } from './enforcePreExamSession';
import { getEligibleSubjects } from './getEligibleSubjects';
import { createSession } from './sessionUtils';
import { sortSessionsByBlock } from './utils/sessionSorter';
import { createExamSlotsMap, sortExamsByDate } from './utils/examUtils';
import * as Sentry from '@sentry/browser';
import { addDays, parseISO, format } from 'date-fns';

/**
 * Creates pre-exam revision sessions for each exam
 * @param {Array} sortedExams - Array of sorted exam objects
 * @param {string} startDate - Start date string in YYYY-MM-DD format
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {Object} blockTimes - User block time preferences
 * @param {Map} examSlots - Map of exam slots to avoid scheduling during exams
 * @returns {Array} Array of pre-exam timetable entries
 */
function createPreExamSessions(sortedExams, startDate, revisionTimes, blockTimes, examSlots) {
  const preExamSessions = [];
  const reservedSlots = new Set(); // Track slots that are reserved for pre-exam sessions
  
  // Process each exam to create a pre-exam session
  for (const exam of sortedExams) {
    const examDate = parseISO(exam.examDate);
    const examSubject = exam.subject;
    const examBlock = exam.timeOfDay || 'Morning';
    
    // Try to find a session on the day before the exam first
    const dayBefore = addDays(examDate, -1);
    const dayBeforeStr = format(dayBefore, 'yyyy-MM-dd');
    const dayOfWeek = getDayOfWeek(dayBefore);
    
    // Check if the previous day has an evening block available for revision
    if (revisionTimes[dayOfWeek] && revisionTimes[dayOfWeek].includes('Evening')) {
      // Check if this slot is not already an exam slot or reserved
      const slotKey = `${dayBeforeStr}-Evening`;
      
      if (!examSlots.has(slotKey) && !reservedSlots.has(slotKey)) {
        // Create evening session on the day before
        const session = createSession(dayBeforeStr, 'Evening', examSubject, blockTimes);
        preExamSessions.push(session);
        reservedSlots.add(slotKey);
        console.log(`Created pre-exam evening session on ${dayBeforeStr} for ${examSubject}`);
        continue; // Continue to next exam after creating session
      }
    }
    
    // If we couldn't create a session on the previous day, try earlier blocks on the exam day
    if (examBlock !== 'Morning' || !revisionTimes[dayOfWeek]?.includes('Evening')) {
      const blocksToTry = examBlock === 'Afternoon' ? ['Morning'] : ['Afternoon', 'Morning'];
      const examDayStr = exam.examDate;
      const examDayOfWeek = getDayOfWeek(examDate);
      
      for (const block of blocksToTry) {
        // Check if this block is available for revision
        if (revisionTimes[examDayOfWeek] && revisionTimes[examDayOfWeek].includes(block)) {
          // Check if this slot is not already an exam slot or reserved
          const slotKey = `${examDayStr}-${block}`;
          
          if (!examSlots.has(slotKey) && !reservedSlots.has(slotKey)) {
            // Create session on exam day in an earlier block
            const session = createSession(examDayStr, block, examSubject, blockTimes);
            preExamSessions.push(session);
            reservedSlots.add(slotKey);
            console.log(`Created pre-exam ${block} session on ${examDayStr} for ${examSubject}`);
            break; // Break after creating first available session
          }
        }
      }
    }
  }
  
  return { preExamSessions, reservedSlots };
}

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

    // First create pre-exam sessions
    const { preExamSessions, reservedSlots } = createPreExamSessions(
      sortedExams, 
      startDate, 
      revisionTimes, 
      blockTimes, 
      examSlots
    );
    
    // Initialize timetable with pre-exam sessions
    const timetableEntries = [...preExamSessions];

    // Track number of sessions per subject for distribution
    const subjectCounts = {};
    sortedExams.forEach(exam => {
      subjectCounts[exam.subject] = 0;
    });
    
    // Update subject counts for pre-exam sessions
    preExamSessions.forEach(session => {
      if (subjectCounts[session.subject] !== undefined) {
        subjectCounts[session.subject] += 1;
      }
    });

    // Then fill in the rest of the timetable
    // Process each date in the range
    for (const date of dateRange) {
      const dayOfWeek = getDayOfWeek(date);
      const availableBlocks = revisionTimes[dayOfWeek] || [];

      // For each available block on this day
      for (const block of availableBlocks) {
        // Skip if there's an exam in this slot
        const slotKey = `${date}-${block}`;
        
        // Skip if slot is reserved for pre-exam session or has an exam
        if (examSlots.has(slotKey) || reservedSlots.has(slotKey)) {
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

    // Still use enforcePreExamSession as a final check to ensure we didn't miss anything
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