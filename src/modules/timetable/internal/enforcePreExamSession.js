import { formatDateToString, getDayOfWeek } from './dateUtils';
import { addDays, parseISO } from 'date-fns';
import { createSession } from './sessionUtils';

/**
 * Ensures that for every exam, the revision session immediately before it is for that exam's subject,
 * unless there is another exam between this exam and the closest revision session before it
 * 
 * Note: This function is now primarily a backup to ensure pre-exam sessions exist.
 * The main pre-exam session assignment happens in timetableGeneratorCore.js.
 * 
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
  
  // Group exams by date to handle consecutive exams properly
  const examsByDate = {};
  exams.forEach(exam => {
    if (!examsByDate[exam.examDate]) {
      examsByDate[exam.examDate] = [];
    }
    examsByDate[exam.examDate].push(exam);
  });
  
  // Track which slots are already used
  const usedSlots = new Set();
  updatedEntries.forEach(entry => {
    usedSlots.add(`${entry.date}-${entry.block}`);
  });
  
  // Process exams by date, handling consecutive exams in reverse order
  for (const [examDate, dateExams] of Object.entries(examsByDate)) {
    if (dateExams.length > 1) {
      // For dates with multiple exams, sort by time of day
      const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
      dateExams.sort((a, b) => blockOrder[a.timeOfDay || 'Morning'] - blockOrder[b.timeOfDay || 'Morning']);
      
      // Process exams in REVERSE order for this date - critical for handling consecutive exams correctly
      // This ensures first exam gets last revision slot, second exam gets earlier slot, etc.
      for (let i = dateExams.length - 1; i >= 0; i--) {
        const exam = dateExams[i];
        const examBlock = exam.timeOfDay || 'Morning';
        
        // Try to find a session on the day before the exam
        const prevDay = addDays(parseISO(exam.examDate), -1);
        const prevDayStr = formatDateToString(prevDay);
        const prevDayOfWeek = getDayOfWeek(prevDay);
        
        // Try blocks in preference order
        const blocksToTry = ['Evening', 'Afternoon', 'Morning'];
        
        for (const block of blocksToTry) {
          // Check if this block is available according to revision times
          if (revisionTimes[prevDayOfWeek] && revisionTimes[prevDayOfWeek].includes(block)) {
            // Check if this slot is free
            const slotKey = `${prevDayStr}-${block}`;
            if (!usedSlots.has(slotKey)) {
              // Create a pre-exam session for this exam
              const newSession = createSession(prevDayStr, block, exam.subject, blockTimes);
              updatedEntries.push(newSession);
              usedSlots.add(slotKey);
              console.log(`Created pre-exam session for consecutive exam: ${exam.subject} on ${prevDayStr} ${block}`);
              break; // Stop after finding a slot
            }
          }
        }
      }
    } else {
      // For single exams on a day, use the original approach
      const exam = dateExams[0];
      processExam(exam, updatedEntries, usedSlots, revisionTimes, blockTimes);
    }
  }
  
  // Final safety check: remove any sessions that conflict with exams
  const filteredEntries = updatedEntries.filter(session => {
    // Is there any exam in this exact time slot?
    const examInSameSlot = exams.some(exam => 
      exam.examDate === session.date && 
      (exam.timeOfDay || 'Morning') === session.block
    );
    
    if (examInSameSlot) {
      console.log(`Removing session in exam slot: ${session.subject} on ${session.date} ${session.block}`);
      return false;
    }
    
    // Is there an exam for this subject on the same day?
    const examForSubjectOnSameDay = exams.find(exam => 
      exam.examDate === session.date && 
      exam.subject === session.subject
    );
    
    if (examForSubjectOnSameDay) {
      const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
      const examBlock = examForSubjectOnSameDay.timeOfDay || 'Morning';
      const sessionBlock = session.block;
      
      // Remove if session is at or after the exam time
      if (blockOrder[sessionBlock] >= blockOrder[examBlock]) {
        console.log(`Removing session after exam: ${session.subject} ${session.block} comes after ${examBlock}`);
        return false;
      }
    }
    
    // If we passed both checks, keep the session
    return true;
  });
  
  return filteredEntries;
}

/**
 * Process a single exam to ensure it has a pre-exam session
 */
function processExam(exam, updatedEntries, usedSlots, revisionTimes, blockTimes) {
  const examDate = parseISO(exam.examDate);
  const examSubject = exam.subject;
  const examBlock = exam.timeOfDay || 'Morning';
  
  // Try to find a session on the day before the exam first
  const dayBefore = addDays(examDate, -1);
  const dayBeforeStr = formatDateToString(dayBefore);
  const dayOfWeek = getDayOfWeek(dayBefore);
  
  // Check if the previous day has an evening block available
  if (revisionTimes[dayOfWeek] && revisionTimes[dayOfWeek].includes('Evening')) {
    // Check if this slot already has an exam or session
    const slotKey = `${dayBeforeStr}-Evening`;
    if (!usedSlots.has(slotKey)) {
      const newSession = createSession(dayBeforeStr, 'Evening', examSubject, blockTimes);
      updatedEntries.push(newSession);
      usedSlots.add(slotKey);
      return;
    }
  }
  
  // If the evening slot is not available, try earlier blocks on the same day
  if (examBlock !== 'Morning') {
    const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
    const examBlockOrder = blockOrder[examBlock];
    
    // Only consider blocks that come BEFORE the exam block
    const earlierBlocks = Object.keys(blockOrder).filter(b => blockOrder[b] < examBlockOrder);
    
    // Try each earlier block in reverse order (closest to exam first)
    const blocksToTry = earlierBlocks.reverse();
    
    const examDayStr = exam.examDate;
    const examDayOfWeek = getDayOfWeek(examDate);
    
    for (const block of blocksToTry) {
      // Check if this block is available according to revision times
      if (revisionTimes[examDayOfWeek] && revisionTimes[examDayOfWeek].includes(block)) {
        // Check if this slot already has a session
        const slotKey = `${examDayStr}-${block}`;
        if (!usedSlots.has(slotKey)) {
          const newSession = createSession(examDayStr, block, examSubject, blockTimes);
          updatedEntries.push(newSession);
          usedSlots.add(slotKey);
          break;
        }
      }
    }
  }
}

/**
 * Generates a numeric timestamp for sorting events
 * @param {Date} date - Date object
 * @param {string} block - Block name
 * @returns {number} Timestamp value
 */
function getTimestamp(date, block) {
  // Base timestamp from date (days since epoch)
  const days = Math.floor(date.getTime() / (24 * 60 * 60 * 1000));
  
  // Add block offset (0-1) to ensure correct order within a day
  const blockOffset = {
    'Morning': 0,
    'Afternoon': 0.33,
    'Evening': 0.66
  }[block] || 0;
  
  return days + blockOffset;
}