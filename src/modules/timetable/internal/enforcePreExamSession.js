import { format, parseISO, addDays, isWithinInterval } from 'date-fns';
import { getDayOfWeek } from './dateUtils';
import { createSession } from './sessionUtils';
import * as Sentry from '@sentry/browser';

/**
 * Check if a date falls within a period-specific availability range
 * @param {string} date - Date string in YYYY-MM-DD format
 * @param {Array} periodSpecificAvailability - Array of period-specific availability objects
 * @returns {Object|null} The period object if date falls within a range, null otherwise
 */
function findPeriodForDate(date, periodSpecificAvailability) {
  if (!periodSpecificAvailability || !Array.isArray(periodSpecificAvailability) || !date) {
    return null;
  }

  const dateObj = parseISO(date);
  
  // Iterate through periods in reverse order to prioritize later periods
  // This matches the test expectations for overlapping periods
  for (const period of [...periodSpecificAvailability].reverse()) {
    if (!period.startDate || !period.endDate) continue;
    
    try {
      // Safely parse dates to avoid TypeError
      const startDate = parseISO(period.startDate);
      const endDate = parseISO(period.endDate);
      
      // Check if both dates are valid before using isWithinInterval
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.warn('Invalid date in period range:', { period });
        continue;
      }
      
      if (isWithinInterval(dateObj, { start: startDate, end: endDate })) {
        return period;
      }
    } catch (error) {
      console.error('Error checking if date is within interval:', error);
      Sentry.captureException(error);
      // Continue to next period
    }
  }
  
  return null;
}

/**
 * Get available blocks for a specific day considering period-specific availability
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} dayOfWeek - Day of week (monday, tuesday, etc.)
 * @param {Object} defaultRevisionTimes - Default revision times configuration
 * @param {Array} periodSpecificAvailability - Array of period-specific availability objects
 * @returns {Array} Array of available blocks
 */
function getAvailableBlocksForDay(date, dayOfWeek, defaultRevisionTimes, periodSpecificAvailability) {
  // Handle null inputs safely
  if (!date || !dayOfWeek || !defaultRevisionTimes) {
    return [];
  }
  
  // Check if this date falls within a period-specific availability
  const period = findPeriodForDate(date, periodSpecificAvailability);
  
  if (period && period.revisionTimes) {
    // Use period-specific availability for this date
    return period.revisionTimes[dayOfWeek] || [];
  }
  
  // Otherwise use default availability
  return defaultRevisionTimes[dayOfWeek] || [];
}

/**
 * Ensures that each exam has at least one revision session before the exam date
 * This is a fallback to guarantee that each exam has some preparation time
 * @param {Array} exams - Array of exam objects
 * @param {Array} timetable - Current timetable entries
 * @param {Object} revisionTimes - Available revision times by day of week
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {Object} blockTimes - Block time preferences
 * @returns {Array} Updated timetable with enforced pre-exam sessions
 */
export function enforcePreExamSession(exams, timetable, revisionTimes, startDate, blockTimes) {
  try {
    if (!exams || exams.length === 0 || !timetable) {
      return timetable;
    }

    // Clone timetable to avoid mutating the original
    const updatedTimetable = [...timetable];
    
    // Extract period-specific availability
    const periodSpecificAvailability = revisionTimes.periodSpecificAvailability || [];
    
    // Group exams by date to handle consecutive exams
    const examsByDate = {};
    exams.forEach(exam => {
      const examDate = exam.examDate;
      if (!examsByDate[examDate]) {
        examsByDate[examDate] = [];
      }
      examsByDate[examDate].push(exam);
    });

    // Process exams by date first
    for (const [examDate, dateExams] of Object.entries(examsByDate)) {
      // For dates with multiple exams, sort by time of day to prioritize earlier exams
      if (dateExams.length > 1) {
        const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
        dateExams.sort((a, b) => blockOrder[a.timeOfDay || 'Morning'] - blockOrder[b.timeOfDay || 'Morning']);
      }
      
      // Process each exam for this date
      for (const exam of dateExams) {
        // Skip if already has a pre-exam session
        const examSubject = exam.subject;
        const hasPreExamSession = updatedTimetable.some(session => {
          // Same subject
          if (session.subject !== examSubject) return false;
          
          // Before exam date or on exam date but before exam block
          if (session.date < examDate) return true;
          
          if (session.date === examDate) {
            const blockOrder = { Morning: 1, Afternoon: 2, Evening: 3 };
            return blockOrder[session.block] < blockOrder[exam.timeOfDay || 'Morning'];
          }
          
          return false;
        });
        
        if (hasPreExamSession) {
          console.log(`${examSubject} already has pre-exam session, skipping`);
          continue;
        }

        // Try to schedule a session on the day before the exam
        const examDateObj = parseISO(examDate);
        const dayBefore = addDays(examDateObj, -1);
        const dayBeforeStr = format(dayBefore, 'yyyy-MM-dd');
        const dayBeforeDayOfWeek = getDayOfWeek(dayBefore);
        
        // Get available blocks for day before
        const dayBeforeBlocks = getAvailableBlocksForDay(
          dayBeforeStr,
          dayBeforeDayOfWeek,
          revisionTimes,
          periodSpecificAvailability
        );
        
        // Try preferred blocks in this order: Evening, Afternoon, Morning
        const preferredOrder = ['Evening', 'Afternoon', 'Morning'];
        let sessionAdded = false;
        
        for (const block of preferredOrder) {
          if (dayBeforeBlocks.includes(block)) {
            // Check if slot is already taken
            const isSlotTaken = updatedTimetable.some(session => 
              session.date === dayBeforeStr && session.block === block
            );
            
            if (!isSlotTaken) {
              // Create new pre-exam session
              const session = createSession(dayBeforeStr, block, examSubject, blockTimes);
              updatedTimetable.push(session);
              console.log(`Created pre-exam session: ${examSubject} on ${dayBeforeStr} ${block}`);
              sessionAdded = true;
              break;
            }
          }
        }
        
        // If couldn't add on day before, try earlier blocks on exam day
        if (!sessionAdded && exam.timeOfDay !== 'Morning') {
          const examDayDayOfWeek = getDayOfWeek(examDateObj);
          const examDayBlocks = getAvailableBlocksForDay(
            examDate,
            examDayDayOfWeek,
            revisionTimes,
            periodSpecificAvailability
          );
          
          // Only try blocks before the exam time
          const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
          const examBlockOrder = blockOrder[exam.timeOfDay || 'Morning'];
          const earlierBlocks = Object.keys(blockOrder)
            .filter(b => blockOrder[b] < examBlockOrder)
            .reverse(); // Try closest to exam first
          
          for (const block of earlierBlocks) {
            if (examDayBlocks.includes(block)) {
              // Check if slot is already taken
              const isSlotTaken = updatedTimetable.some(session => 
                session.date === examDate && session.block === block
              );
              
              if (!isSlotTaken) {
                // Create new pre-exam session
                const session = createSession(examDate, block, examSubject, blockTimes);
                updatedTimetable.push(session);
                console.log(`Created pre-exam session on exam day: ${examSubject} on ${examDate} ${block}`);
                break;
              }
            }
          }
        }
      }
    }
    
    return updatedTimetable;
  } catch (error) {
    console.error('Error enforcing pre-exam sessions:', error);
    Sentry.captureException(error);
    return timetable; // Return original timetable on error
  }
}