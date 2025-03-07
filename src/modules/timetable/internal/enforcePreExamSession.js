import { formatDateToString, getDayOfWeek } from './dateUtils';
import { addDays, parseISO, isAfter, isBefore, isSameDay } from 'date-fns';
import { createSession } from './sessionUtils';

/**
 * Ensures that the session right before an exam is for that exam's subject
 * @param {Array} exams - Array of exam objects
 * @param {Array} timetableEntries - Array of timetable entry objects
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {string} startDate - Start date string in YYYY-MM-DD format
 * @param {Object} blockTimes - User block time preferences (optional)
 * @returns {Array} Updated timetable entries
 */
export function enforcePreExamSession(exams, timetableEntries, revisionTimes, startDate, blockTimes = {}) {
  if (!exams.length) return timetableEntries;

  // Clone the timetable entries to avoid modifying the original
  const updatedEntries = [...timetableEntries];
  
  // Create a map of exam slots for quick lookup
  const examSlots = new Map();
  exams.forEach(exam => {
    const key = `${exam.examDate}-${exam.timeOfDay || 'Morning'}`;
    examSlots.set(key, exam.subject);
  });
  
  // Process each exam to ensure it has a pre-exam session
  // Sort exams by date to prioritize earlier exams first
  const sortedExams = [...exams].sort((a, b) => 
    new Date(a.examDate) - new Date(b.examDate)
  );
  
  for (const exam of sortedExams) {
    const examDate = parseISO(exam.examDate);
    const examTimeOfDay = exam.timeOfDay || 'Morning';
    
    // Determine what session should be reserved for this exam
    let targetDate = examDate;
    let targetBlock = getPreExamBlock(examTimeOfDay);
    
    // If the exam is in the morning, try to reserve evening session from day before
    if (examTimeOfDay === 'Morning') {
      const prevDay = addDays(examDate, -1);
      const prevDayOfWeek = getDayOfWeek(prevDay);
      
      // Check if the previous day has an evening session available
      if (revisionTimes[prevDayOfWeek] && revisionTimes[prevDayOfWeek].includes('Evening')) {
        targetDate = prevDay;
        targetBlock = 'Evening';
      }
    }
    
    const targetDateStr = formatDateToString(targetDate);
    
    // Check if the target slot has an exam scheduled
    const targetSlotKey = `${targetDateStr}-${targetBlock}`;
    if (examSlots.has(targetSlotKey)) {
      console.log(`Cannot add pre-exam session for ${exam.subject} on ${targetDateStr}-${targetBlock} because there is an exam scheduled in that slot`);
      continue; // Skip to the next exam
    }
    
    // Find if this session already exists
    const existingEntryIndex = updatedEntries.findIndex(
      entry => entry.date === targetDateStr && entry.block === targetBlock
    );
    
    if (existingEntryIndex >= 0) {
      // Update the existing entry to this exam's subject
      // Create a new object to avoid reference issues
      updatedEntries[existingEntryIndex] = {
        ...updatedEntries[existingEntryIndex],
        subject: exam.subject
      };
    } else {
      // Only add a new entry if this timeslot is available in the user's preferences
      const dayOfWeek = getDayOfWeek(targetDate);
      if (revisionTimes[dayOfWeek] && revisionTimes[dayOfWeek].includes(targetBlock)) {
        // Use createSession to ensure all required properties are present
        updatedEntries.push(
          createSession(targetDateStr, targetBlock, exam.subject, blockTimes)
        );
      }
    }
  }
  
  return updatedEntries;
}

/**
 * Gets the appropriate block for a pre-exam session based on exam time
 * @param {string} examTimeOfDay - Time of day for the exam (Morning, Afternoon, Evening)
 * @returns {string} Block name for pre-exam session
 */
function getPreExamBlock(examTimeOfDay) {
  switch (examTimeOfDay) {
    case 'Morning':
      return 'Morning'; // Will try Evening the day before first
    case 'Afternoon':
      return 'Morning';
    case 'Evening':
      return 'Afternoon';
    default:
      return 'Morning';
  }
}