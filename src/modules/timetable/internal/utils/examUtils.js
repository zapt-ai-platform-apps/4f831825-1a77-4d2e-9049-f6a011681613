import { parseISO } from 'date-fns';

/**
 * Creates a map of date-block combinations where exams are scheduled
 * @param {Array} exams - Array of exam objects
 * @returns {Map} Map of exam slots
 */
export function createExamSlotsMap(exams) {
  const examSlots = new Map();
  
  exams.forEach(exam => {
    const examDate = exam.examDate;
    const block = exam.timeOfDay || 'Morning';
    const key = `${examDate}-${block}`;
    
    if (!examSlots.has(key)) {
      examSlots.set(key, []);
    }
    
    examSlots.get(key).push(exam.subject);
  });
  
  return examSlots;
}

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