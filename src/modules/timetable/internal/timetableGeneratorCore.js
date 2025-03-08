import { parseISO } from 'date-fns';
import { createDateRange, getDayOfWeek } from './dateUtils';
import { enforcePreExamSession } from './enforcePreExamSession';
import { createSession } from './sessionUtils';
import { sortSessionsByBlock } from './utils/sessionSorter';
import * as Sentry from '@sentry/browser';
import { getEligibleSubjects } from './getEligibleSubjects';
import { createExamSlotsMap, sortExamsByDate } from './utils/examUtils';

/**
 * Core timetable generation logic shared between client and server
 * @param {Array} exams - Array of exam objects
 * @param {string} startDate - Start date string in YYYY-MM-DD format
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {Object} blockTimes - User block time preferences
 * @param {Function} idGenerator - Function to generate unique IDs
 * @returns {Array} Array of timetable entry objects
 */
export async function generateTimetableCore(
  exams,
  startDate,
  revisionTimes,
  blockTimes,
  idGenerator
) {
  try {
    // Validate input parameters
    if (!exams || !Array.isArray(exams)) {
      console.error("Invalid exams parameter:", exams);
      throw new Error("Exams data is invalid or missing");
    }
    
    if (!startDate) {
      console.error("Missing startDate parameter");
      throw new Error("Start date is required");
    }
    
    if (!revisionTimes || typeof revisionTimes !== 'object') {
      console.error("Invalid revisionTimes parameter:", revisionTimes);
      throw new Error("Revision times are invalid or missing");
    }
    
    // Check if any revision times are selected
    const hasRevisionTimes = Object.values(revisionTimes).some(
      blocks => Array.isArray(blocks) && blocks.length > 0
    );
    
    if (!hasRevisionTimes) {
      console.error("No revision times selected");
      throw new Error("No revision times selected. Please select at least one time slot.");
    }
    
    // Filter and sort exams
    const sortedExams = sortExamsByDate(filterUpcomingExams(exams));
    
    if (sortedExams.length === 0) {
      console.warn("No upcoming exams found");
      return [];
    }
    
    // Determine the end date (latest exam date)
    const endDate = sortedExams[sortedExams.length - 1].examDate;
    
    // Create date range between start date and end date
    const dateRange = createDateRange(startDate, endDate);
    if (!dateRange || !Array.isArray(dateRange) || dateRange.length === 0) {
      console.error("Failed to create date range", { startDate, endDate });
      throw new Error("Failed to create valid date range");
    }
    
    // Create a map of exam slots to exclude
    const examSlots = createExamSlotsMap(sortedExams);
    
    // Generate available sessions
    const availableSessions = generateAvailableSessions(dateRange, revisionTimes, examSlots);
    
    if (availableSessions.length === 0) {
      console.error("No available sessions found. Check revision times and date range.");
      throw new Error("No available sessions found with your current preferences.");
    }
    
    // Distribute subjects to create initial timetable
    let timetable = distributeSubjects(sortedExams, availableSessions, blockTimes, examSlots);
    
    // Enforce pre-exam sessions (ensuring last session before an exam is that subject)
    timetable = enforcePreExamSession(sortedExams, timetable, revisionTimes, startDate, blockTimes);
    
    // Add unique IDs to each session for tracking and future updates
    timetable = timetable.map(session => ({
      ...session,
      id: idGenerator ? idGenerator() : session.id || generateDefaultId()
    }));
    
    console.log(`Generated timetable with ${timetable.length} sessions`);
    return timetable;
  } catch (error) {
    console.error("Error in generateTimetableCore:", error);
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Filters out exams that have already passed
 * @param {Array} exams - Array of exam objects
 * @returns {Array} Array of upcoming exams
 */
function filterUpcomingExams(exams) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return exams.filter(exam => {
    const examDate = parseISO(exam.examDate);
    return examDate >= today;
  });
}

/**
 * Generates all available sessions based on date range and revision times
 * @param {Array} dateRange - Array of date strings
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {Map} examSlots - Map of exam slots to exclude
 * @returns {Array} Array of available session objects
 */
function generateAvailableSessions(dateRange, revisionTimes, examSlots) {
  if (!dateRange || !Array.isArray(dateRange) || dateRange.length === 0) {
    console.error("Invalid dateRange in generateAvailableSessions:", dateRange);
    return [];
  }
  
  const sessions = [];
  
  dateRange.forEach(date => {
    if (!date) {
      console.error("Found invalid date in dateRange:", date);
      return;
    }
    
    const dayOfWeek = getDayOfWeek(date);
    const availableBlocks = revisionTimes[dayOfWeek] || [];
    
    // Process each time block separately - never skip the entire day
    availableBlocks.forEach(block => {
      // Check if this specific slot has an exam
      const slotKey = `${date}-${block}`;
      if (examSlots.has(slotKey)) {
        console.log(`Skipping slot ${slotKey} because there's an exam scheduled`);
        return; // Skip only this specific time slot
      }
      
      // Add this time slot as available
      sessions.push({
        date,
        block,
        available: true
      });
    });
  });
  
  return sortSessionsByBlock(sessions);
}

/**
 * Distributes subjects across available sessions
 * @param {Array} exams - Array of sorted exam objects
 * @param {Array} availableSessions - Array of available session objects
 * @param {Object} blockTimes - User block time preferences
 * @param {Map} examSlots - Map of exam slots
 * @returns {Array} Array of timetable entry objects
 */
function distributeSubjects(exams, availableSessions, blockTimes, examSlots) {
  if (exams.length === 0 || availableSessions.length === 0) {
    return [];
  }
  
  // Sort available sessions in reverse (from end date to start date)
  const reversedSessions = [...availableSessions].reverse();
  
  // Track how many sessions each subject has been assigned
  const subjectCounts = {};
  exams.forEach(exam => {
    subjectCounts[exam.subject] = 0;
  });
  
  // Track already assigned date-block combinations
  const assignedSlots = new Set();
  
  // Array to hold our final timetable entries
  const timetableEntries = [];
  
  // Process each available session
  reversedSessions.forEach(session => {
    // Verify session has a date (defensive programming)
    if (!session || !session.date) {
      console.error("Invalid session without date:", session);
      return;
    }
    
    const sessionKey = `${session.date}-${session.block}`;
    
    // Skip if this slot is already assigned
    if (assignedSlots.has(sessionKey)) {
      return;
    }
    
    // Skip if there's an exam in this slot
    if (examSlots.has(sessionKey)) {
      return;
    }
    
    // Get eligible subjects for this session
    const eligibleSubjects = getEligibleSubjects(session.date, session.block, exams, subjectCounts, examSlots);
    
    if (eligibleSubjects.length === 0) {
      return;
    }
    
    // Pick subject with fewest assignments
    const selectedSubject = eligibleSubjects.reduce((a, b) => 
      subjectCounts[a] <= subjectCounts[b] ? a : b
    );
    
    // Create and add the session
    const newSession = createSession(
      session.date,
      session.block,
      selectedSubject,
      blockTimes
    );
    
    // Ensure created session has a date before adding
    if (newSession && newSession.date) {
      timetableEntries.push(newSession);
      
      // Mark this slot as assigned and increment subject count
      assignedSlots.add(sessionKey);
      subjectCounts[selectedSubject]++;
    } else {
      console.error("Created session missing date:", newSession);
    }
  });
  
  return timetableEntries;
}

/**
 * Generates a default ID when no ID generator is provided
 * @returns {string} Random ID
 */
function generateDefaultId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}