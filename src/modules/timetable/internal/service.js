import { api as timetableApi } from '../api';
import { eventBus } from '../../core/events';
import { events } from '../events';
import * as Sentry from '@sentry/browser';

/**
 * Format dates with data for the calendar
 * 
 * @param {Object} timetable - Timetable data
 * @param {Array} exams - Exams data
 * @returns {Object} Formatted dates with data
 */
export function formatDatesWithData(timetable, exams) {
  const datesWithData = {};
  const subjectsSet = new Set();

  // Process timetable sessions
  for (const dateStr in timetable) {
    const sessions = timetable[dateStr];
    datesWithData[dateStr] = datesWithData[dateStr] || { sessions: [], exams: [] };
    for (const session of sessions) {
      datesWithData[dateStr].sessions.push(session);
      subjectsSet.add(session.subject);
    }
  }

  // Process exams and add exam data to datesWithData, while collecting subjects.
  for (const exam of exams) {
    const dateStr = exam.examDate;
    datesWithData[dateStr] = datesWithData[dateStr] || { sessions: [], exams: [] };
    datesWithData[dateStr].exams.push(exam);
    subjectsSet.add(exam.subject);
  }

  return {
    datesWithData,
    subjectsSet
  };
}

/**
 * Build subject color mapping
 * 
 * @param {Set} subjectsSet - Set of subjects
 * @param {Array} exams - Exams data with possible colors
 * @returns {Object} Subject to color mapping
 */
export function buildSubjectColorMapping(subjectsSet, exams) {
  const subjectColours = {};
  const defaultColors = [
    '#00d2ff', // Light Blue
    '#0083b0', // Dark Blue
    '#8e44ad', // Purple
    '#3c3b3f', // Gray
    '#11998e', // Teal
    '#38ef7d', // Light Green
    '#b1ea4d', // Yellow Green
  ];

  let colorIndex = 0;
  for (const subject of subjectsSet) {
    // Check if any exam for this subject has a non-empty exam colour.
    const examForSubject = exams.find((exam) => exam.subject === subject && exam.examColour);
    if (examForSubject && examForSubject.examColour) {
      subjectColours[subject] = examForSubject.examColour;
    } else {
      subjectColours[subject] = defaultColors[colorIndex % defaultColors.length];
      colorIndex++;
    }
  }

  return subjectColours;
}

/**
 * Calculate month limits based on preferences and exams
 * 
 * @param {Object} preferences - User preferences
 * @param {Array} exams - User exams
 * @returns {Object} Min and max dates
 */
export function calculateMonthLimits(preferences, exams) {
  let minDate = null;
  let maxDate = null;
  
  if (preferences?.startDate) {
    minDate = new Date(preferences.startDate);
    minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  }
  
  if (exams?.length > 0) {
    const examDates = exams.map(exam => new Date(exam.examDate));
    const lastExamDate = new Date(Math.max.apply(null, examDates));
    maxDate = new Date(lastExamDate.getFullYear(), lastExamDate.getMonth() + 1, 0);
  }
  
  return { minDate, maxDate };
}

/**
 * Get or create current month based on preferences
 * 
 * @param {Date|null} currentMonth - Current selected month
 * @param {Object} preferences - User preferences
 * @returns {Date} Current month
 */
export function getOrCreateCurrentMonth(currentMonth, preferences) {
  if (currentMonth) return currentMonth;
  
  if (preferences?.startDate) {
    const startDate = new Date(preferences.startDate);
    return new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  }
  
  return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
}