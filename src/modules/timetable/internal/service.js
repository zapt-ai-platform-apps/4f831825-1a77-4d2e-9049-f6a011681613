import { parseISO, isAfter, isBefore, format, addMonths } from 'date-fns';
import * as Sentry from '@sentry/browser';

/**
 * Formats dates with data for display in the timetable
 * @param {Object} timetable - Timetable data
 * @param {Array} exams - Exams data
 * @returns {Object} Formatted dates with data
 */
export function formatDatesWithData(timetable, exams) {
  const datesWithData = {};
  const subjectsSet = new Set();
  
  // Process timetable sessions
  Object.entries(timetable).forEach(([date, sessions]) => {
    if (!datesWithData[date]) {
      datesWithData[date] = { 
        sessions: [], 
        exams: [] 
      };
    }
    
    sessions.forEach(session => {
      datesWithData[date].sessions.push(session);
      subjectsSet.add(session.subject);
    });
  });
  
  // Process exams
  exams.forEach(exam => {
    const date = exam.examDate;
    
    if (!datesWithData[date]) {
      datesWithData[date] = { 
        sessions: [], 
        exams: [] 
      };
    }
    
    datesWithData[date].exams.push(exam);
    subjectsSet.add(exam.subject);
  });
  
  return { datesWithData, subjectsSet };
}

/**
 * Builds a mapping of subjects to colors
 * @param {Set} subjectsSet - Set of subject names
 * @param {Array} exams - Exams data
 * @returns {Object} Subject color mapping
 */
export function buildSubjectColorMapping(subjectsSet, exams) {
  const subjectColours = {};
  const subjects = Array.from(subjectsSet);
  
  // First, assign any custom colors from exams
  exams.forEach(exam => {
    if (exam.examColour) {
      subjectColours[exam.subject] = exam.examColour;
    }
  });
  
  // For any remaining subjects without assigned colors, generate random colors
  subjects.forEach(subject => {
    if (!subjectColours[subject]) {
      subjectColours[subject] = getRandomColor();
    }
  });
  
  return subjectColours;
}

/**
 * Calculates min and max dates for the timetable
 * @param {Object} preferences - User preferences
 * @param {Array} exams - Exams data
 * @returns {Object} Min and max dates
 */
export function calculateMonthLimits(preferences, exams) {
  let minDate = null;
  let maxDate = null;
  
  if (preferences?.startDate) {
    minDate = parseISO(preferences.startDate);
  }
  
  if (exams && exams.length > 0) {
    // Find the latest exam date
    let latestExamDate = null;
    
    exams.forEach(exam => {
      const examDate = parseISO(exam.examDate);
      if (!latestExamDate || isAfter(examDate, latestExamDate)) {
        latestExamDate = examDate;
      }
    });
    
    if (latestExamDate) {
      // Set max date to 1 month after the latest exam
      maxDate = addMonths(latestExamDate, 1);
    }
  }
  
  return { minDate, maxDate };
}

/**
 * Gets or creates the current month for display
 * @param {Date} currentMonth - Current month
 * @param {Object} preferences - User preferences
 * @returns {Date} Current month to display
 */
export function getOrCreateCurrentMonth(currentMonth, preferences) {
  if (currentMonth) {
    return currentMonth;
  }
  
  // If we have preferences with a start date, use that as the initial month
  if (preferences?.startDate) {
    try {
      const startDate = parseISO(preferences.startDate);
      return new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    } catch (error) {
      console.error('Error parsing start date:', error);
      Sentry.captureException(error);
    }
  }
  
  // Default to current month
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Generates a random color
 * @returns {string} Random hex color
 */
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}