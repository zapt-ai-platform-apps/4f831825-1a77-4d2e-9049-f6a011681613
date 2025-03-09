import { formatDateToString, getDayOfWeek } from './dateUtils';
import { addDays, parseISO } from 'date-fns';
import { createSession } from './sessionUtils';

/**
 * Ensures that for every exam, the revision session immediately before it is for that exam's subject,
 * unless there is another exam between this exam and the closest revision session before it
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
  
  // Process each exam
  for (let i = 0; i < allEvents.length; i++) {
    const event = allEvents[i];
    
    // Skip if not an exam
    if (event.type !== 'exam') continue;
    
    // Look backward to find the closest session before this exam
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
      console.log(`Updating existing session at index ${closestSessionIndex} to subject ${event.subject}`);
      updatedEntries[closestSessionIndex] = {
        ...updatedEntries[closestSessionIndex],
        subject: event.subject
      };
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
        const hasExam = allEvents.some(e => 
          e.type === 'exam' && e.dateString === prevDayStr && e.block === 'Evening'
        );
        
        // If no exam in this slot, create a new session
        if (!hasExam) {
          console.log(`Creating new Evening session on ${prevDayStr} for ${event.subject}`);
          const newSession = createSession(prevDayStr, 'Evening', event.subject, blockTimes);
          updatedEntries.push(newSession);
          
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
      
      // If the exam is not in the morning, try earlier blocks on the same day
      if (event.block !== 'Morning') {
        const blocksToTry = event.block === 'Afternoon' ? ['Morning'] : ['Afternoon', 'Morning'];
        const examDayStr = event.dateString;
        const examDayOfWeek = getDayOfWeek(examDate);
        
        for (const block of blocksToTry) {
          // Check if this block is available
          if (revisionTimes[examDayOfWeek] && revisionTimes[examDayOfWeek].includes(block)) {
            // Check if this slot already has an exam
            const hasExam = allEvents.some(e => 
              e.type === 'exam' && e.dateString === examDayStr && e.block === block
            );
            
            if (!hasExam) {
              console.log(`Creating new ${block} session on ${examDayStr} for ${event.subject}`);
              const newSession = createSession(examDayStr, block, event.subject, blockTimes);
              updatedEntries.push(newSession);
              
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
  
  return updatedEntries;
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