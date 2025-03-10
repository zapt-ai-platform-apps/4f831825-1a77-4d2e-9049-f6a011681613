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
  
  // Track which slots are already used by which subject
  const usedSlots = new Map(); // Map to track subject for each slot
  updatedEntries.forEach(entry => {
    usedSlots.set(`${entry.date}-${entry.block}`, entry.subject);
  });
  
  // Process exams by date, handling consecutive exams properly
  for (const [examDate, dateExams] of Object.entries(examsByDate)) {
    if (dateExams.length > 1) {
      // For dates with multiple exams, sort by time of day
      const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
      dateExams.sort((a, b) => blockOrder[a.timeOfDay || 'Morning'] - blockOrder[b.timeOfDay || 'Morning']);
      
      // Process exams in FORWARD order for consecutive exams
      for (let i = 0; i < dateExams.length; i++) {
        const exam = dateExams[i];
        // Always create a new session for consecutive exams, don't update existing ones
        createDedicatedPreExamSession(exam, updatedEntries, revisionTimes, usedSlots, blockTimes);
      }
    } else {
      // For single exams, process normally
      const exam = dateExams[0];
      findAndCreatePreExamSession(exam, updatedEntries, revisionTimes, usedSlots, blockTimes);
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
 * Special function for consecutive exams that ALWAYS creates a new session
 * rather than updating existing ones
 * @param {Object} exam - The exam to create a session for
 * @param {Array} updatedEntries - Array of timetable entries to update
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {Map} usedSlots - Map of used slots to their subjects
 * @param {Object} blockTimes - User block time preferences
 * @returns {boolean} Whether a session was created
 */
function createDedicatedPreExamSession(exam, updatedEntries, revisionTimes, usedSlots, blockTimes) {
  const examDate = parseISO(exam.examDate);
  const examSubject = exam.subject;
  const examTimeOfDay = exam.timeOfDay || 'Morning';
  
  // Choose block preference based on exam time
  let blocksToTry;
  if (examTimeOfDay === 'Afternoon') {
    // For afternoon exams, prioritize afternoon slot the day before
    blocksToTry = ['Afternoon', 'Evening', 'Morning'];
  } else {
    // For morning or evening exams, or when time not specified
    blocksToTry = ['Evening', 'Afternoon', 'Morning'];
  }
  
  // Try to find a session on the day before the exam first (preferred)
  const dayBefore = addDays(examDate, -1);
  const dayBeforeStr = formatDateToString(dayBefore);
  const dayOfWeek = getDayOfWeek(dayBefore);
  
  for (const block of blocksToTry) {
    // Check if this block is available according to revision times
    if (revisionTimes[dayOfWeek] && revisionTimes[dayOfWeek].includes(block)) {
      const slotKey = `${dayBeforeStr}-${block}`;
      
      // If the slot is already used for this subject, consider it done
      if (usedSlots.has(slotKey) && usedSlots.get(slotKey) === examSubject) {
        console.log(`Slot ${dayBeforeStr} ${block} already has session for ${examSubject}`);
        return true;
      }
      
      // If slot is available or used by different subject (for consecutive exams)
      // Try to find a different slot rather than update
      if (!usedSlots.has(slotKey)) {
        // Create a new session
        const newSession = createSession(dayBeforeStr, block, examSubject, blockTimes);
        updatedEntries.push(newSession);
        usedSlots.set(slotKey, examSubject);
        console.log(`Created dedicated pre-exam session: ${examSubject} on ${dayBeforeStr} ${block}`);
        return true;
      }
    }
  }
  
  // If no slot is available on the day before, try earlier blocks on the exam day
  if (exam.timeOfDay && exam.timeOfDay !== 'Morning') {
    const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
    const examBlock = exam.timeOfDay;
    const examBlockOrder = blockOrder[examBlock];
    
    // Only consider blocks that come BEFORE the exam block
    const earlierBlocks = Object.keys(blockOrder)
      .filter(b => blockOrder[b] < examBlockOrder)
      .sort((a, b) => blockOrder[b] - blockOrder[a]); // Try closest to exam first
    
    const examDayStr = exam.examDate;
    const examDayOfWeek = getDayOfWeek(examDate);
    
    for (const block of earlierBlocks) {
      if (revisionTimes[examDayOfWeek] && revisionTimes[examDayOfWeek].includes(block)) {
        const slotKey = `${examDayStr}-${block}`;
        
        // If the slot is already used for this subject, consider it done
        if (usedSlots.has(slotKey) && usedSlots.get(slotKey) === examSubject) {
          console.log(`Slot ${examDayStr} ${block} already has session for ${examSubject}`);
          return true;
        }
        
        // Only create a new session if slot is completely available
        if (!usedSlots.has(slotKey)) {
          // Create new session
          const newSession = createSession(examDayStr, block, examSubject, blockTimes);
          updatedEntries.push(newSession);
          usedSlots.set(slotKey, examSubject);
          console.log(`Created same-day pre-exam session: ${examSubject} on ${examDayStr} ${block}`);
          return true;
        }
      }
    }
  }
  
  // If we still couldn't find a suitable slot, look two days before
  const twoDaysBefore = addDays(examDate, -2);
  const twoDaysBeforeStr = formatDateToString(twoDaysBefore);
  const twoDaysBeforeDayOfWeek = getDayOfWeek(twoDaysBefore);
  
  for (const block of blocksToTry) {
    if (revisionTimes[twoDaysBeforeDayOfWeek] && revisionTimes[twoDaysBeforeDayOfWeek].includes(block)) {
      const slotKey = `${twoDaysBeforeStr}-${block}`;
      
      // Check if already used for this subject
      if (usedSlots.has(slotKey) && usedSlots.get(slotKey) === examSubject) {
        console.log(`Slot ${twoDaysBeforeStr} ${block} already has session for ${examSubject}`);
        return true;
      }
      
      // Only use if completely available
      if (!usedSlots.has(slotKey)) {
        const newSession = createSession(twoDaysBeforeStr, block, examSubject, blockTimes);
        updatedEntries.push(newSession);
        usedSlots.set(slotKey, examSubject);
        console.log(`Created pre-exam session two days before: ${examSubject} on ${twoDaysBeforeStr} ${block}`);
        return true;
      }
    }
  }
  
  console.warn(`Couldn't find a suitable pre-exam slot for ${examSubject} exam on ${exam.examDate}`);
  return false;
}

/**
 * Helper function to find an available slot and create a pre-exam session
 * @param {Object} exam - The exam to create a pre-exam session for
 * @param {Array} updatedEntries - Array of timetable entries to update
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {Map} usedSlots - Map of used slots to their subjects
 * @param {Object} blockTimes - User block time preferences
 * @returns {boolean} Whether a session was created
 */
function findAndCreatePreExamSession(exam, updatedEntries, revisionTimes, usedSlots, blockTimes) {
  const examDate = parseISO(exam.examDate);
  const examSubject = exam.subject;
  
  // Try to find a session on the day before the exam first
  const dayBefore = addDays(examDate, -1);
  const dayBeforeStr = formatDateToString(dayBefore);
  const dayOfWeek = getDayOfWeek(dayBefore);
  
  // Try blocks in preference order
  const blocksToTry = ['Evening', 'Afternoon', 'Morning'];
  
  for (const block of blocksToTry) {
    // Check if this block is available according to revision times
    if (revisionTimes[dayOfWeek] && revisionTimes[dayOfWeek].includes(block)) {
      const slotKey = `${dayBeforeStr}-${block}`;
      
      // Check if this slot is already used
      if (usedSlots.has(slotKey)) {
        const existingSubject = usedSlots.get(slotKey);
        
        // If the slot is already used for this subject, we can consider it done
        if (existingSubject === examSubject) {
          console.log(`Slot ${dayBeforeStr} ${block} already has session for ${examSubject}`);
          return true;
        }
        
        // Find the existing entry to update it
        const existingIndex = updatedEntries.findIndex(
          entry => entry.date === dayBeforeStr && entry.block === block
        );
        
        if (existingIndex >= 0) {
          // Update the existing session to this subject
          updatedEntries[existingIndex].subject = examSubject;
          usedSlots.set(slotKey, examSubject);
          console.log(`Updated existing session on ${dayBeforeStr} ${block} from ${existingSubject} to ${examSubject}`);
          return true;
        }
      }
      
      // Slot is available, create a new session
      const newSession = createSession(dayBeforeStr, block, examSubject, blockTimes);
      updatedEntries.push(newSession);
      usedSlots.set(slotKey, examSubject);
      console.log(`Created pre-exam session: ${examSubject} on ${dayBeforeStr} ${block}`);
      return true;
    }
  }
  
  // If we couldn't find a slot on the previous day, try earlier blocks on the exam day
  if (exam.timeOfDay && exam.timeOfDay !== 'Morning') {
    const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
    const examBlock = exam.timeOfDay;
    const examBlockOrder = blockOrder[examBlock];
    
    // Only consider blocks that come BEFORE the exam block
    const earlierBlocks = Object.keys(blockOrder)
      .filter(b => blockOrder[b] < examBlockOrder)
      .sort((a, b) => blockOrder[b] - blockOrder[a]); // Try closest to exam first
    
    const examDayStr = exam.examDate;
    const examDayOfWeek = getDayOfWeek(examDate);
    
    for (const block of earlierBlocks) {
      if (revisionTimes[examDayOfWeek] && revisionTimes[examDayOfWeek].includes(block)) {
        const slotKey = `${examDayStr}-${block}`;
        
        // Check if this slot is already used
        if (usedSlots.has(slotKey)) {
          const existingSubject = usedSlots.get(slotKey);
          
          // If the slot is already used for this subject, we can consider it done
          if (existingSubject === examSubject) {
            console.log(`Slot ${examDayStr} ${block} already has session for ${examSubject}`);
            return true;
          }
          
          // Find the existing entry to update it
          const existingIndex = updatedEntries.findIndex(
            entry => entry.date === examDayStr && entry.block === block
          );
          
          if (existingIndex >= 0) {
            // Update the existing session to this subject
            updatedEntries[existingIndex].subject = examSubject;
            usedSlots.set(slotKey, examSubject);
            console.log(`Updated existing session on ${examDayStr} ${block} from ${existingSubject} to ${examSubject}`);
            return true;
          }
        } else {
          // Create new session
          const newSession = createSession(examDayStr, block, examSubject, blockTimes);
          updatedEntries.push(newSession);
          usedSlots.set(slotKey, examSubject);
          console.log(`Created same-day pre-exam session: ${examSubject} on ${examDayStr} ${block}`);
          return true;
        }
      }
    }
  }
  
  // If we couldn't find a suitable slot, look one more day back
  const twoDaysBefore = addDays(examDate, -2);
  const twoDaysBeforeStr = formatDateToString(twoDaysBefore);
  const twoDaysBeforeDayOfWeek = getDayOfWeek(twoDaysBefore);
  
  for (const block of blocksToTry) {
    if (revisionTimes[twoDaysBeforeDayOfWeek] && revisionTimes[twoDaysBeforeDayOfWeek].includes(block)) {
      const slotKey = `${twoDaysBeforeStr}-${block}`;
      
      if (usedSlots.has(slotKey)) {
        const existingSubject = usedSlots.get(slotKey);
        
        // If the slot is already used for this subject, we can consider it done
        if (existingSubject === examSubject) {
          console.log(`Slot ${twoDaysBeforeStr} ${block} already has session for ${examSubject}`);
          return true;
        }
        
        // Find the existing entry to update it
        const existingIndex = updatedEntries.findIndex(
          entry => entry.date === twoDaysBeforeStr && entry.block === block
        );
        
        if (existingIndex >= 0) {
          // Update the existing session to this subject
          updatedEntries[existingIndex].subject = examSubject;
          usedSlots.set(slotKey, examSubject);
          console.log(`Updated existing session on ${twoDaysBeforeStr} ${block} from ${existingSubject} to ${examSubject}`);
          return true;
        }
      } else {
        const newSession = createSession(twoDaysBeforeStr, block, examSubject, blockTimes);
        updatedEntries.push(newSession);
        usedSlots.set(slotKey, examSubject);
        console.log(`Created pre-exam session two days before: ${examSubject} on ${twoDaysBeforeStr} ${block}`);
        return true;
      }
    }
  }
  
  console.warn(`Couldn't find a suitable pre-exam slot for ${examSubject} exam on ${exam.examDate}`);
  return false;
}