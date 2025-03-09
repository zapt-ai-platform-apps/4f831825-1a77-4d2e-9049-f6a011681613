import { parseISO, format, addMonths } from 'date-fns';
import * as Sentry from '@sentry/browser';

/**
 * Formats dates with timetable and exam data
 * @param {Object} timetable - Timetable data by date
 * @param {Array} exams - Exam data
 * @returns {Object} Formatted dates with data and subjects set
 */
export function formatDatesWithData(timetable, exams) {
  const datesWithData = {};
  const subjectsSet = new Set();
  
  // Format timetable data
  Object.entries(timetable).forEach(([date, sessions]) => {
    if (!datesWithData[date]) {
      datesWithData[date] = { sessions: [], exams: [] };
    }
    
    // Filter out sessions that occur after an exam for the same subject on the same day
    const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
    
    const filteredSessions = sessions.filter(session => {
      // Check if there's an exam for this subject on this day
      const examOnSameDay = exams.find(exam => 
        exam.examDate === date && 
        exam.subject === session.subject
      );
      
      if (examOnSameDay) {
        const examBlock = examOnSameDay.timeOfDay || 'Morning';
        // Only keep sessions that are before the exam
        return blockOrder[session.block] < blockOrder[examBlock];
      }
      
      // If no exam on the same day, keep the session
      return true;
    });
    
    datesWithData[date].sessions = filteredSessions;
    
    // Collect unique subjects
    filteredSessions.forEach(session => {
      subjectsSet.add(session.subject);
    });
  });
  
  // Add exam data
  exams.forEach(exam => {
    const date = exam.examDate;
    
    if (!datesWithData[date]) {
      datesWithData[date] = { sessions: [], exams: [] };
    }
    
    datesWithData[date].exams.push(exam);
    subjectsSet.add(exam.subject);
  });
  
  return { datesWithData, subjectsSet };
}

/**
 * Builds subject color mapping
 * @param {Set} subjectsSet - Set of subjects
 * @param {Array} exams - Exam data
 * @returns {Object} Subject color mapping
 */
export function buildSubjectColorMapping(subjectsSet, exams) {
  const subjectColours = {};
  
  // Start with exam colors
  exams.forEach(exam => {
    if (exam.examColour) {
      subjectColours[exam.subject] = exam.examColour;
    }
  });
  
  // For subjects without colors, generate pastel colors
  const subjects = Array.from(subjectsSet);
  
  subjects.forEach(subject => {
    if (!subjectColours[subject]) {
      subjectColours[subject] = generatePastelColor();
    }
  });
  
  return subjectColours;
}

/**
 * Generates a random pastel color
 * @returns {string} Hex color code
 */
function generatePastelColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
}

/**
 * Calculate month limits based on preferences and exams
 * @param {Object} preferences - User preferences
 * @param {Array} exams - Exam data
 * @returns {Object} Min and max dates
 */
export function calculateMonthLimits(preferences, exams) {
  let minDate = null;
  let maxDate = null;
  
  // Set min date from preferences if available
  if (preferences?.startDate) {
    try {
      minDate = parseISO(preferences.startDate);
    } catch (error) {
      console.error('Error parsing start date:', error);
      Sentry.captureException(error);
    }
  }
  
  // Otherwise use today's date
  if (!minDate) {
    minDate = new Date();
  }
  
  // Find latest exam date for max date
  if (exams && exams.length > 0) {
    try {
      const examDates = exams.map(exam => parseISO(exam.examDate));
      const latestExam = new Date(Math.max(...examDates));
      
      // Set max date to the latest exam date (removed the +1 month buffer)
      maxDate = latestExam;
    } catch (error) {
      console.error('Error finding latest exam date:', error);
      Sentry.captureException(error);
    }
  }
  
  // If no max date could be determined, default to 6 months from min
  if (!maxDate) {
    maxDate = addMonths(minDate, 6);
  }
  
  return { minDate, maxDate };
}

/**
 * Get or create current month
 * @param {Date} currentMonth - Current month
 * @param {Object} preferences - User preferences
 * @returns {Date} Current month
 */
export function getOrCreateCurrentMonth(currentMonth, preferences) {
  if (currentMonth) return currentMonth;
  
  // Try to use preferences start date
  if (preferences?.startDate) {
    try {
      return parseISO(preferences.startDate);
    } catch (error) {
      console.error('Error parsing preference start date:', error);
    }
  }
  
  // Otherwise use today
  return new Date();
}