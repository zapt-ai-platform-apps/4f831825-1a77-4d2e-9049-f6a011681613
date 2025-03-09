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
  
  // Normalize all events to have a timestamp for easier sorting
  const allEvents = [];
  
  // Add exams
  exams.forEach(exam => {
    allEvents.push({
      type: 'exam',
      subject: exam.subject,
      date: parseISO(exam.examDate),
      dateString: exam.examDate,
      block: exam.timeOfDay || 'Morning',
      timestamp: getTimestamp(parseISO(exam.examDate), exam.timeOfDay || 'Morning')
    });
  });
  
  // Add existing timetable entries
  updatedEntries.forEach((entry, index) => {
    allEvents.push({
      type: 'session',
      subject: entry.subject,
      date: parseISO(entry.date),
      dateString: entry.date,
      block: entry.block,
      timestamp: getTimestamp(parseISO(entry.date), entry.block),
      index: index
    });
  });
  
  // Sort all events chronologically
  allEvents.sort((a, b) => a.timestamp - b.timestamp);
  
  // Track which slots are already used
  const usedSlots = new Set();
  updatedEntries.forEach(entry => {
    usedSlots.add(`${entry.date}-${entry.block}`);
  });
  
  // Process each exam
  for (let i = 0; i < allEvents.length; i++) {
    const event = allEvents[i];
    
    // Skip if not an exam
    if (event.type !== 'exam') continue;
    
    // Look for any sessions in the same time slot as this exam and remove them
    const sameSlotSessionIndices = [];
    for (let j = 0; j < updatedEntries.length; j++) {
      if (updatedEntries[j].date === event.dateString && updatedEntries[j].block === event.block) {
        sameSlotSessionIndices.push(j);
      }
    }
    
    if (sameSlotSessionIndices.length > 0) {
      // Remove sessions in this slot (in reverse order to not mess up indices)
      for (let j = sameSlotSessionIndices.length - 1; j >= 0; j--) {
        console.log(`Removing revision session that conflicts with exam: ${event.subject} on ${event.dateString} ${event.block}`);
        updatedEntries.splice(sameSlotSessionIndices[j], 1);
      }
      
      // Also remove from allEvents array
      for (let k = allEvents.length - 1; k >= 0; k--) {
        if (allEvents[k].type === 'session' && 
            allEvents[k].dateString === event.dateString && 
            allEvents[k].block === event.block) {
          allEvents.splice(k, 1);
          if (k <= i) i--; // Adjust index if we removed an element before current position
        }
      }
      
      // Continue to the next exam since we've removed conflicting sessions
      continue;
    }
    
    // If no session in the same slot, look backward to find the closest session before this exam
    // and check that there isn't another exam in between
    let closestSessionIndex = -1;
    let foundExamBetween = false;
    
    for (let j = i - 1; j >= 0; j--) {
      const prevEvent = allEvents[j];
      
      if (prevEvent.type === 'exam') {
        // There's another exam in between
        foundExamBetween = true;
        break;
      } else if (prevEvent.type === 'session') {
        // Found a session
        closestSessionIndex = prevEvent.index;
        break;
      }
    }
    
    // If we found a suitable session, update it for this exam
    if (closestSessionIndex >= 0 && !foundExamBetween) {
      // Update the existing session to match this exam's subject
      updatedEntries[closestSessionIndex] = {
        ...updatedEntries[closestSessionIndex],
        subject: event.subject
      };
      
      // Update the event in allEvents array to reflect this change
      for (let k = 0; k < allEvents.length; k++) {
        if (allEvents[k].type === 'session' && allEvents[k].index === closestSessionIndex) {
          allEvents[k].subject = event.subject;
          break;
        }
      }
    } else {
      // We need to create a new session for this exam
      // First try the day before the exam
      const examDate = event.date;
      const prevDay = addDays(examDate, -1);
      const prevDayStr = formatDateToString(prevDay);
      const prevDayOfWeek = getDayOfWeek(prevDay);
      
      // Check if the previous day has an evening block available
      if (revisionTimes[prevDayOfWeek] && revisionTimes[prevDayOfWeek].includes('Evening')) {
        // Check if this slot already has an exam or session
        const slotKey = `${prevDayStr}-Evening`;
        if (!usedSlots.has(slotKey)) {
          const newSession = createSession(prevDayStr, 'Evening', event.subject, blockTimes);
          updatedEntries.push(newSession);
          usedSlots.add(slotKey);
          
          // Also add to our events array for future exams to consider
          allEvents.push({
            type: 'session',
            subject: event.subject,
            date: prevDay,
            dateString: prevDayStr,
            block: 'Evening',
            timestamp: getTimestamp(prevDay, 'Evening'),
            index: updatedEntries.length - 1
          });
          
          // Resort the events array after adding the new session
          allEvents.sort((a, b) => a.timestamp - b.timestamp);
          
          // Update our current index since we've added a new event
          i = allEvents.findIndex(e => e === event);
          
          // Continue to the next exam
          continue;
        }
      }
      
      // If the exam is not in the morning or if we couldn't add a session on the previous day, 
      // try earlier blocks on the same day
      if (event.block !== 'Morning' || !revisionTimes[prevDayOfWeek]?.includes('Evening')) {
        // Define blocks to try, ensuring they are earlier than the exam block
        const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
        const examBlockOrder = blockOrder[event.block];
        
        // Only consider blocks that come BEFORE the exam block
        const earlierBlocks = Object.keys(blockOrder).filter(b => blockOrder[b] < examBlockOrder);
        
        // Try each earlier block in reverse order (closest to exam first)
        const blocksToTry = earlierBlocks.reverse();
        
        const examDayStr = event.dateString;
        const examDayOfWeek = getDayOfWeek(examDate);
        
        for (const block of blocksToTry) {
          // Check if this block is available according to revision times
          if (revisionTimes[examDayOfWeek] && revisionTimes[examDayOfWeek].includes(block)) {
            // Check if this slot already has a session
            const slotKey = `${examDayStr}-${block}`;
            if (!usedSlots.has(slotKey)) {
              // IMPORTANT: Create session on exam day in an EARLIER block only
              if (blockOrder[block] >= examBlockOrder) {
                console.error(`Cannot create session after exam: ${block} comes after ${event.block}`);
                continue;
              }
              
              const newSession = createSession(examDayStr, block, event.subject, blockTimes);
              updatedEntries.push(newSession);
              usedSlots.add(slotKey);
              
              // Add to our events array
              allEvents.push({
                type: 'session',
                subject: event.subject,
                date: examDate,
                dateString: examDayStr,
                block: block,
                timestamp: getTimestamp(examDate, block),
                index: updatedEntries.length - 1
              });
              
              // Resort and update index
              allEvents.sort((a, b) => a.timestamp - b.timestamp);
              i = allEvents.findIndex(e => e === event);
              
              // Session created, break out of the loop
              break;
            }
          }
        }
      }
    }
  }
  
  // Final safety check: remove any sessions that conflict with exams
  const filteredEntries = updatedEntries.filter(session => {
    // First check: Is there any exam in this exact time slot?
    const examInSameSlot = exams.some(exam => 
      exam.examDate === session.date && 
      (exam.timeOfDay || 'Morning') === session.block
    );
    
    if (examInSameSlot) {
      console.log(`Removing session in exam slot: ${session.subject} on ${session.date} ${session.block}`);
      return false;
    }
    
    // Second check: Is there an exam for this subject on the same day?
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