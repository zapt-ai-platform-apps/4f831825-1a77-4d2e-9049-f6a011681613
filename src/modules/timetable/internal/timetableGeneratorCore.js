import { createDateRange, getDayOfWeek } from './dateUtils';
import { enforcePreExamSession } from './enforcePreExamSession';
import { getEligibleSubjects } from './getEligibleSubjects';
import { createSession } from './sessionUtils';
import { sortSessionsByBlock } from './utils/sessionSorter';
import { createExamSlotsMap, sortExamsByDate } from './utils/examUtils';
import { captureTimetableError } from './errorUtils';
import * as Sentry from '@sentry/browser';
import { addDays, parseISO, format, isValid, isBefore } from 'date-fns';
import { api as preferencesApi } from '../../preferences/api';

/**
 * Creates pre-exam revision sessions for each exam
 * @param {Array} sortedExams - Array of sorted exam objects
 * @param {string} startDate - Start date string in YYYY-MM-DD format
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {Object} blockTimes - User block time preferences
 * @param {Map} examSlots - Map of exam slots to avoid scheduling during exams
 * @param {Array} periodSpecificAvailability - Custom availability settings for specific dates
 * @returns {Array} Array of pre-exam timetable entries
 */
function createPreExamSessions(sortedExams, startDate, revisionTimes, blockTimes, examSlots, periodSpecificAvailability) {
  const preExamSessions = [];
  const reservedSlots = new Set(); // Track slots that are reserved for pre-exam sessions
  
  // Group exams by date to handle consecutive exams
  const examsByDate = {};
  sortedExams.forEach(exam => {
    const examDate = exam.examDate;
    if (!examsByDate[examDate]) {
      examsByDate[examDate] = [];
    }
    examsByDate[examDate].push(exam);
  });
  
  // Create a map for quickly checking period-specific availability
  const availabilityMap = new Map();
  
  periodSpecificAvailability.forEach(entry => {
    const key = `${entry.startDate}_${entry.endDate}_${entry.dayOfWeek}-${entry.block}`;
    availabilityMap.set(key, entry.isAvailable);
  });
  
  // Check if a specific date and block is available based on both default preferences and period-specific settings
  const isBlockAvailable = (date, block) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDayOfWeek(date);
    
    // Check for period-specific overrides
    for (const entry of periodSpecificAvailability) {
      const entryStartDate = parseISO(entry.startDate);
      const entryEndDate = parseISO(entry.endDate);
      
      if (
        date >= entryStartDate && 
        date <= entryEndDate && 
        dayOfWeek === entry.dayOfWeek.toLowerCase() &&
        entry.block === block
      ) {
        // Found a specific entry for this date/block
        return entry.isAvailable;
      }
    }
    
    // If no override found, use default availability
    return revisionTimes[dayOfWeek]?.includes(block) || false;
  };
  
  // Process exams by date, handling consecutive exams in forward order
  for (const [examDate, dateExams] of Object.entries(examsByDate)) {
    if (dateExams.length > 1) {
      // For dates with multiple exams, sort by time of day
      const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
      dateExams.sort((a, b) => blockOrder[a.timeOfDay || 'Morning'] - blockOrder[b.timeOfDay || 'Morning']);
      
      // Process exams in FORWARD order to prioritize EARLIER exams for BETTER slots
      for (let i = 0; i < dateExams.length; i++) {
        const exam = dateExams[i];
        createPreExamSessionForExam(exam, isBlockAvailable, blockTimes, examSlots, 
                                  preExamSessions, reservedSlots);
      }
    } else {
      // For single exams, process normally
      createPreExamSessionForExam(dateExams[0], isBlockAvailable, blockTimes, examSlots, 
                                preExamSessions, reservedSlots);
    }
  }
  
  return { preExamSessions, reservedSlots };
}

/**
 * Creates a pre-exam session for a specific exam
 */
function createPreExamSessionForExam(exam, isBlockAvailable, blockTimes, examSlots, 
                                  preExamSessions, reservedSlots) {
  const examDate = parseISO(exam.examDate);
  const examSubject = exam.subject;
  const examBlock = exam.timeOfDay || 'Morning';
  
  // Try to find a session on the day before the exam first
  const dayBefore = addDays(examDate, -1);
  const dayBeforeStr = format(dayBefore, 'yyyy-MM-dd');
  
  // Check if the previous day has an evening block available for revision
  if (isBlockAvailable(dayBefore, 'Evening')) {
    // Check if this slot is not already an exam slot or reserved
    const slotKey = `${dayBeforeStr}-Evening`;
    
    if (!examSlots.has(slotKey) && !reservedSlots.has(slotKey)) {
      // Create evening session on the day before
      const session = createSession(dayBeforeStr, 'Evening', examSubject, blockTimes);
      preExamSessions.push(session);
      reservedSlots.add(slotKey);
      console.log(`Created pre-exam evening session on ${dayBeforeStr} for ${examSubject}`);
      return; // Continue to next exam after creating session
    }
  }
  
  // Try Afternoon slot on the day before
  if (isBlockAvailable(dayBefore, 'Afternoon')) {
    const slotKey = `${dayBeforeStr}-Afternoon`;
    
    if (!examSlots.has(slotKey) && !reservedSlots.has(slotKey)) {
      const session = createSession(dayBeforeStr, 'Afternoon', examSubject, blockTimes);
      preExamSessions.push(session);
      reservedSlots.add(slotKey);
      console.log(`Created pre-exam afternoon session on ${dayBeforeStr} for ${examSubject}`);
      return;
    }
  }
  
  // If we couldn't create a session on the previous day, try earlier blocks on the exam day
  if (examBlock !== 'Morning') {
    const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
    const examBlockOrder = blockOrder[examBlock];
    
    // Only consider blocks that come BEFORE the exam block
    const earlierBlocks = Object.keys(blockOrder).filter(b => blockOrder[b] < examBlockOrder);
    
    // Try each earlier block in reverse order (closest to exam first)
    const blocksToTry = earlierBlocks.reverse();
    
    const examDayStr = exam.examDate;
    
    for (const block of blocksToTry) {
      // Check if this block is available for revision
      if (isBlockAvailable(examDate, block)) {
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
  const generationContext = {
    exams: JSON.parse(JSON.stringify(exams || [])), // Deep clone to avoid mutation
    startDate,
    revisionTimes: JSON.parse(JSON.stringify(revisionTimes || {})), // Deep clone
    blockTimes: JSON.parse(JSON.stringify(blockTimes || {})), // Deep clone
    location: 'timetableGeneratorCore.js'
  };
  
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
    
    // Validate that the start date is not in the past
    const parsedStartDate = parseISO(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    
    if (!isValid(parsedStartDate)) {
      throw new Error('Invalid start date format');
    }
    
    // Skip past date validation in test environment
    const isTestEnvironment = typeof process !== 'undefined' && 
      (process.env.NODE_ENV === 'test' || process.env.VITEST);
    
    if (!isTestEnvironment && isBefore(parsedStartDate, today)) {
      throw new Error('Start date cannot be in the past');
    }

    // Sort exams by date
    const sortedExams = sortExamsByDate(exams);
    
    // Add sorting information to context
    generationContext.additionalData = {
      ...generationContext.additionalData,
      examSortOrder: sortedExams.map(e => `${e.subject} (${e.examDate})`)
    };

    // Find latest exam date
    const latestExamDate = sortedExams[sortedExams.length - 1].examDate;

    // Create date range from start date to latest exam date
    const dateRange = createDateRange(startDate, latestExamDate);
    
    // Add date range to context
    generationContext.additionalData = {
      ...generationContext.additionalData,
      dateRange: {
        start: startDate,
        end: latestExamDate,
        totalDays: dateRange.length
      }
    };

    // Create map of exam slots to avoid scheduling during exams
    const examSlots = createExamSlotsMap(sortedExams);
    
    // Fetch period-specific availability to consider custom settings
    let periodSpecificAvailability = [];
    try {
      periodSpecificAvailability = await preferencesApi.getPeriodSpecificAvailability();
      console.log(`Loaded ${periodSpecificAvailability.length} period-specific availability entries`);
    } catch (error) {
      console.error('Failed to fetch period-specific availability:', error);
      Sentry.captureException(error);
      // Continue with default preferences if we can't get custom settings
    }

    // Create a function to check if a date/block is available based on both default preferences and period-specific settings
    const isBlockAvailable = (date, block) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOfWeek = getDayOfWeek(date);
      
      // Check for period-specific overrides
      for (const entry of periodSpecificAvailability) {
        const entryStartDate = parseISO(entry.startDate);
        const entryEndDate = parseISO(entry.endDate);
        
        if (
          date >= entryStartDate && 
          date <= entryEndDate && 
          dayOfWeek === entry.dayOfWeek.toLowerCase() &&
          entry.block === block
        ) {
          // Found a specific entry for this date/block
          return entry.isAvailable;
        }
      }
      
      // If no override found, use default availability
      return revisionTimes[dayOfWeek]?.includes(block) || false;
    };

    // First create pre-exam sessions
    const { preExamSessions, reservedSlots } = createPreExamSessions(
      sortedExams, 
      startDate, 
      revisionTimes, 
      blockTimes, 
      examSlots,
      periodSpecificAvailability
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

    console.log("Initial subject counts after pre-exam sessions:", JSON.stringify(subjectCounts));
    
    // Add pre-exam session info to context
    generationContext.additionalData = {
      ...generationContext.additionalData,
      preExamSessions: preExamSessions.length,
      initialSubjectCounts: { ...subjectCounts }
    };

    // Then fill in the rest of the timetable
    // Process each date in the range
    for (const date of dateRange) {
      const dateObj = parseISO(date);
      const dayOfWeek = getDayOfWeek(date);
      
      // Get available blocks for this day, considering both default preferences and custom settings
      const availableBlocks = ['Morning', 'Afternoon', 'Evening'].filter(block => 
        isBlockAvailable(dateObj, block)
      );

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
        // Enhanced sorting with explicit comparison and logs
        const subjectsByCount = [...eligibleSubjects].sort((a, b) => {
          const countA = subjectCounts[a] || 0;
          const countB = subjectCounts[b] || 0;
          return countA - countB;
        });

        // Log decision making process for this slot
        console.log(`Slot ${date} ${block} - Eligible subjects:`, eligibleSubjects.map(s => 
          `${s} (${subjectCounts[s] || 0} sessions)`
        ));
        console.log(`Selected subject: ${subjectsByCount[0]} with ${subjectCounts[subjectsByCount[0]] || 0} sessions`);

        const chosenSubject = subjectsByCount[0];
        subjectCounts[chosenSubject] = (subjectCounts[chosenSubject] || 0) + 1;

        // Create session and add to timetable
        timetableEntries.push(createSession(date, block, chosenSubject, blockTimes));
      }
    }

    console.log("Final subject counts:", JSON.stringify(subjectCounts));
    
    // Add final distribution to context
    generationContext.additionalData = {
      ...generationContext.additionalData,
      finalSubjectCounts: { ...subjectCounts }
    };

    // Use enforcePreExamSession as a final check to ensure we didn't miss anything
    let finalTimetable = enforcePreExamSession(
      sortedExams,
      timetableEntries,
      revisionTimes,
      startDate,
      blockTimes
    );
    
    // Additional safety filter: remove any sessions in exam slots
    finalTimetable = finalTimetable.filter(session => {
      const slotKey = `${session.date}-${session.block}`;
      if (examSlots.has(slotKey)) {
        console.log(`Removing session in exam slot (second pass): ${session.subject} on ${session.date} ${session.block}`);
        return false;
      }
      return true;
    });
    
    // Sort the final timetable by date and block
    const sortedTimetable = sortSessionsByBlock(finalTimetable);
    
    // Add final timetable stats to context
    generationContext.additionalData = {
      ...generationContext.additionalData,
      generatedEntries: sortedTimetable.length,
      successfulGeneration: true
    };

    return sortedTimetable;
  } catch (error) {
    // Enhanced error handling with full context
    generationContext.additionalData = {
      ...generationContext.additionalData,
      errorMessage: error.message,
      errorStack: error.stack,
      successfulGeneration: false
    };
    
    captureTimetableError(error, generationContext);
    throw error;
  }
}

/**
 * Main export for both client and server side timetable generation
 */
export async function generateTimetable(exams, startDate, revisionTimes, blockTimes) {
  return generateTimetableCore(exams, startDate, revisionTimes, blockTimes);
}