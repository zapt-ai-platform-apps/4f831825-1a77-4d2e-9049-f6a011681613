import { parseISO, addDays, isAfter, isBefore, isSameDay } from 'date-fns';
import { sortExamsByDate, filterUpcomingExams } from '../../exams/internal/examUtils';
import { createDateRange, getDayOfWeek } from './dateUtils';
import { enforcePreExamSession } from './enforcePreExamSession';
import { createSession } from './sessionUtils';
import { sortSessionsByBlock } from './utils/sessionSorter';
import { generateId } from '../../core/internal/helpers';

/**
 * Generates a complete timetable for a user
 * @param {Array} exams - Array of exam objects
 * @param {string} startDate - Start date string in YYYY-MM-DD format
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {Object} blockTimes - User block time preferences
 * @returns {Array} Array of timetable entry objects
 */
export async function generateTimetable(exams, startDate, revisionTimes, blockTimes) {
  // Filter and sort exams
  const upcomingExams = filterUpcomingExams(exams);
  const sortedExams = sortExamsByDate(upcomingExams);
  
  if (sortedExams.length === 0) {
    return [];
  }
  
  // Determine the end date (latest exam date)
  const endDate = sortedExams[sortedExams.length - 1].examDate;
  
  // Create date range between start date and end date
  const dateRange = createDateRange(startDate, endDate);
  
  // Generate available sessions
  const availableSessions = generateAvailableSessions(dateRange, revisionTimes);
  
  // Distribute subjects to create initial timetable
  let timetable = distributeSubjects(sortedExams, availableSessions, blockTimes);
  
  // Enforce pre-exam sessions (ensuring last session before an exam is that subject)
  timetable = enforcePreExamSession(sortedExams, timetable, revisionTimes, startDate);
  
  // Add unique IDs to each session for tracking and future updates
  timetable = timetable.map(session => ({
    ...session,
    id: generateId()
  }));
  
  return timetable;
}

/**
 * Generates all available sessions based on date range and revision times
 * @param {Array} dateRange - Array of date strings
 * @param {Object} revisionTimes - Available revision times by day of week
 * @returns {Array} Array of available session objects
 */
function generateAvailableSessions(dateRange, revisionTimes) {
  const sessions = [];
  
  dateRange.forEach(date => {
    const dayOfWeek = getDayOfWeek(date);
    const availableBlocks = revisionTimes[dayOfWeek] || [];
    
    availableBlocks.forEach(block => {
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
 * @returns {Array} Array of timetable entry objects
 */
function distributeSubjects(exams, availableSessions, blockTimes) {
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
    const sessionKey = `${session.date}-${session.block}`;
    
    // Skip if this slot is already assigned
    if (assignedSlots.has(sessionKey)) {
      return;
    }
    
    // Get eligible subjects for this session
    const eligibleSubjects = getEligibleSubjects(session.date, exams, subjectCounts);
    
    if (eligibleSubjects.length === 0) {
      return;
    }
    
    // Pick subject with fewest assignments
    const selectedSubject = eligibleSubjects.reduce((a, b) => 
      subjectCounts[a] <= subjectCounts[b] ? a : b
    );
    
    // Create and add the session
    timetableEntries.push(createSession(
      session.date,
      session.block,
      selectedSubject,
      blockTimes
    ));
    
    // Mark this slot as assigned and increment subject count
    assignedSlots.add(sessionKey);
    subjectCounts[selectedSubject]++;
  });
  
  return timetableEntries;
}

/**
 * Gets eligible subjects for a particular date
 * @param {string} date - Date string in YYYY-MM-DD format
 * @param {Array} exams - Array of exam objects
 * @param {Object} subjectCounts - Map of subjects to their assignment counts
 * @returns {Array} Array of eligible subject names
 */
function getEligibleSubjects(date, exams, subjectCounts) {
  const sessionDate = parseISO(date);
  
  // Filter subjects that haven't had their exam yet on this date
  return exams
    .filter(exam => {
      const examDate = parseISO(exam.examDate);
      return !isBefore(examDate, sessionDate);
    })
    .map(exam => exam.subject);
}