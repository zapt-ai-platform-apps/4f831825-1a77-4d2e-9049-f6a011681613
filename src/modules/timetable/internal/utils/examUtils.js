import { parseISO } from 'date-fns';

/**
 * Creates a map of exam slots to exclude from revision sessions
 * @param {Array} exams - Array of exam objects
 * @returns {Map<string, Array<string>>} Map of date-block combinations to array of subjects
 */
export function createExamSlotsMap(exams) {
  if (!exams || !Array.isArray(exams)) {
    console.warn('createExamSlotsMap called with invalid exams array');
    return new Map();
  }
  
  const examSlots = new Map();
  
  exams.forEach(exam => {
    if (!exam.examDate) {
      console.warn('Exam missing examDate:', exam);
      return;
    }
    
    // Create a unique key for this exam's time slot
    const slotKey = `${exam.examDate}-${exam.timeOfDay || 'Morning'}`;
    
    if (!examSlots.has(slotKey)) {
      examSlots.set(slotKey, []);
    }
    
    examSlots.get(slotKey).push(exam.subject);
  });
  
  return examSlots;
}

/**
 * Sorts exams by date and time of day
 * @param {Array} exams - Array of exam objects
 * @returns {Array} Sorted array of exam objects
 */
export function sortExamsByDate(exams) {
  if (!exams || !Array.isArray(exams)) {
    console.warn('sortExamsByDate called with invalid exams array');
    return [];
  }
  
  return [...exams].sort((a, b) => {
    // Handle missing dates
    if (!a.examDate) return 1;
    if (!b.examDate) return -1;
    
    const dateA = parseISO(a.examDate);
    const dateB = parseISO(b.examDate);
    
    // Handle invalid dates
    if (isNaN(dateA.getTime())) return 1;
    if (isNaN(dateB.getTime())) return -1;
    
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

/**
 * Checks if an exam slot is available for revision
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {Map} examSlots - Map of exam slots
 * @returns {boolean} Whether the slot is available
 */
export function isSlotAvailable(date, block, examSlots) {
  if (!date || !block || !examSlots) {
    return false;
  }
  
  const slotKey = `${date}-${block}`;
  return !examSlots.has(slotKey);
}