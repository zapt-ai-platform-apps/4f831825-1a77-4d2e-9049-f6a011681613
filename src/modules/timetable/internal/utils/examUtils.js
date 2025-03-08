import { parseISO } from 'date-fns';

/**
 * Creates a map of exam slots to exclude from revision sessions
 * @param {Array} exams - Array of exam objects
 * @returns {Map} Map of date-block combinations to array of subjects
 */
export function createExamSlotsMap(exams) {
  const examSlots = new Map();
  
  exams.forEach(exam => {
    const slotKey = `${exam.examDate}-${exam.timeOfDay || 'Morning'}`;
    
    if (!examSlots.has(slotKey)) {
      examSlots.set(slotKey, []);
    }
    
    examSlots.get(slotKey).push(exam.subject);
  });
  
  return examSlots;
}

/**
 * Sorts exams by date
 * @param {Array} exams - Array of exam objects
 * @returns {Array} Sorted array of exam objects
 */
export function sortExamsByDate(exams) {
  return [...exams].sort((a, b) => {
    const dateA = parseISO(a.examDate);
    const dateB = parseISO(b.examDate);
    
    if (dateA.getTime() === dateB.getTime()) {
      // For same-day exams, sort by time of day
      const timeOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
      const timeA = timeOrder[a.timeOfDay || 'Morning'];
      const timeB = timeOrder[b.timeOfDay || 'Morning'];
      return timeA - timeB;
    }
    
    return dateA.getTime() - dateB.getTime();
  });
}