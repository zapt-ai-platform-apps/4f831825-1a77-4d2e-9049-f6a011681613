import { parseISO, isBefore, isAfter, format } from 'date-fns';

/**
 * Sorts exams by date (earliest first)
 * @param {Array} exams - Array of exam objects
 * @returns {Array} Sorted array of exams
 */
export function sortExamsByDate(exams) {
  return [...exams].sort((a, b) => {
    const dateA = parseISO(a.examDate);
    const dateB = parseISO(b.examDate);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Filters out exams that have already passed
 * @param {Array} exams - Array of exam objects
 * @returns {Array} Array of upcoming exams
 */
export function filterUpcomingExams(exams) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return exams.filter(exam => {
    const examDate = parseISO(exam.examDate);
    return !isBefore(examDate, today);
  });
}

/**
 * Gets all unique subjects from exams
 * @param {Array} exams - Array of exam objects
 * @returns {Array} Array of unique subject names
 */
export function getUniqueSubjects(exams) {
  const subjectSet = new Set();
  
  exams.forEach(exam => {
    if (exam.subject) {
      subjectSet.add(exam.subject);
    }
  });
  
  return Array.from(subjectSet);
}

/**
 * Creates a mapping of subjects to their exam colors
 * @param {Array} exams - Array of exam objects
 * @returns {Object} Mapping of subject names to colors
 */
export function createSubjectColorMap(exams) {
  const colorMap = {};
  
  exams.forEach(exam => {
    if (exam.subject && exam.examColour) {
      colorMap[exam.subject] = exam.examColour;
    }
  });
  
  return colorMap;
}