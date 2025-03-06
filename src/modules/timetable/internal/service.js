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
  
  // For any remaining subjects without assigned colors, generate deterministic colors
  subjects.forEach(subject => {
    if (!subjectColours[subject]) {
      subjectColours[subject] = getConsistentColor(subject);
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
 * Generates a consistent color based on subject name
 * @param {string} subject - Subject name
 * @returns {string} Hex color
 */
function getConsistentColor(subject) {
  // Generate a consistent hash from the subject name
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to RGB color
  const r = (hash & 0xFF0000) >> 16;
  const g = (hash & 0x00FF00) >> 8;
  const b = hash & 0x0000FF;
  
  // Ensure colors are vibrant enough (minimum brightness)
  const minBrightness = 60; // Adjust as needed
  const clamp = (value) => Math.max(minBrightness, value);
  
  // Convert to hex and ensure each component has 2 digits
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
}