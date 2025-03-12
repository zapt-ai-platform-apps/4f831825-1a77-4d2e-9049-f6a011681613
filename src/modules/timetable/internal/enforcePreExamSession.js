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
  
  for (const period of periodSpecificAvailability) {
    if (isWithinInterval(dateObj, {
      start: parseISO(period.startDate),
      end: parseISO(period.endDate)
    })) {
      return period;
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
  // Check if this date falls within a period-specific availability
  const period = findPeriodForDate(date, periodSpecificAvailability);
  
  if (period) {
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
    
    // For each exam, check if there's a session before the exam
    for (const exam of exams) {
      const examDate = exam.examDate;
      const examSubject = exam.subject;
      const examBlock = exam.timeOfDay || 'Morning';
      
      // Check if there's already a session for this subject before the exam
      const hasPreExamSession = timetable.some(session => {
        // Same subject
        if (session.subject !== examSubject) return false;
        
        // Before exam date or on exam date but before exam block
        if (session.date < examDate) return true;
        
        if (session.date === examDate) {
          const blockOrder = { Morning: 1, Afternoon: 2, Evening: 3 };
          return blockOrder[session.block] < blockOrder[examBlock];
        }
        
        return false;
      });
      
      // Skip if already has a pre-exam session
      if (hasPreExamSession) {
        continue;
      }
      
      // Try to find a slot for a pre-exam session
      
      // Try day before exam first
      const examDateObj = parseISO(examDate);
      const dayBefore = addDays(examDateObj, -1);
      const dayBeforeStr = format(dayBefore, 'yyyy-MM-dd');
      const dayBeforeDayOfWeek = getDayOfWeek(dayBefore);
      
      // Get available blocks for day before, considering period-specific availability
      const dayBeforeBlocks = getAvailableBlocksForDay(
        dayBeforeStr,
        dayBeforeDayOfWeek,
        revisionTimes,
        periodSpecificAvailability
      );
      
      // Prefer evening, then afternoon, then morning
      const preferredOrder = ['Evening', 'Afternoon', 'Morning'];
      
      // Try each preferred block
      for (const block of preferredOrder) {
        // Check if block is available on day before
        if (dayBeforeBlocks.includes(block)) {
          // Check if slot is already taken in timetable
          const isSlotTaken = updatedTimetable.some(session => 
            session.date === dayBeforeStr && session.block === block
          );
          
          if (!isSlotTaken) {
            // Create new pre-exam session
            const session = createSession(dayBeforeStr, block, examSubject, blockTimes);
            updatedTimetable.push(session);
            console.log(`Enforced pre-exam session added: ${examSubject} on ${dayBeforeStr} ${block}`);
            break; // Stop after finding a slot
          }
        }
      }
      
      // If couldn't add on day before, try earlier blocks on exam day
      if (examBlock !== 'Morning') {
        // Only try blocks before exam
        const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
        const examBlockOrder = blockOrder[examBlock];
        const earlierBlocks = Object.keys(blockOrder)
          .filter(b => blockOrder[b] < examBlockOrder)
          .reverse(); // Try closest to exam first
        
        const examDayOfWeek = getDayOfWeek(examDateObj);
        
        // Get available blocks for exam day, considering period-specific availability
        const examDayBlocks = getAvailableBlocksForDay(
          examDate,
          examDayOfWeek,
          revisionTimes,
          periodSpecificAvailability
        );
        
        // Try each earlier block
        for (const block of earlierBlocks) {
          // Check if block is available on exam day
          if (examDayBlocks.includes(block)) {
            // Check if slot is already taken in timetable
            const isSlotTaken = updatedTimetable.some(session => 
              session.date === examDate && session.block === block
            );
            
            if (!isSlotTaken) {
              // Create new pre-exam session
              const session = createSession(examDate, block, examSubject, blockTimes);
              updatedTimetable.push(session);
              console.log(`Enforced pre-exam session added: ${examSubject} on ${examDate} ${block}`);
              break; // Stop after finding a slot
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