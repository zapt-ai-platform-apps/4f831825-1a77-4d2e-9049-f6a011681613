import { parseISO, isBefore, isAfter, isSameDay } from 'date-fns';

/**
 * Gets eligible subjects for a particular date and block
 * @param {string} date - Date string in YYYY-MM-DD format
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {Array} exams - Array of exam objects
 * @param {Object} subjectCounts - Map of subjects to their assignment counts
 * @param {Map} examSlots - Map of exam slots
 * @returns {Array} Array of eligible subject names
 */
export function getEligibleSubjects(date, block, exams, subjectCounts, examSlots) {
  // First, check if there's an exam in this exact slot
  const exactSlotKey = `${date}-${block}`;
  if (examSlots.has(exactSlotKey)) {
    // If there's any exam in this exact slot, no subjects are eligible
    console.log(`No eligible subjects for ${date}-${block} (exam slot)`);
    return [];
  }
  
  const sessionDate = parseISO(date);
  
  // Get times of day in sequential order
  const timeOrder = { 'Morning': 0, 'Afternoon': 1, 'Evening': 2 };
  const currentTimeOrder = timeOrder[block];
  
  // Find exams on this day 
  const sameDay = Array.from(examSlots.keys())
    .filter(key => key.startsWith(date))
    .map(key => {
      const [, timeBlock] = key.split('-');
      return { 
        block: timeBlock, 
        timeOrder: timeOrder[timeBlock],
        subjects: examSlots.get(key) 
      };
    });
  
  // Filter out subjects that have exams at or after the current block on the same day
  const excludedSubjects = new Set();
  
  // Find subjects with exams in this slot or later slots
  sameDay.forEach(({ block: examBlock, timeOrder: examTimeOrder, subjects }) => {
    // Only exclude subjects with exams in this block or later blocks on the same day
    if (examTimeOrder >= currentTimeOrder) {
      subjects.forEach(subject => excludedSubjects.add(subject));
    }
  });
  
  // Helper function to check if two dates are the same day (more explicit)
  const areSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };
  
  // Filter subjects that haven't had their exam yet (or have had it earlier this day)
  return exams
    .filter(exam => {
      const examDate = parseISO(exam.examDate);
      
      // Exclude subjects whose exams have already passed on previous days
      if (examDate < sessionDate && !areSameDay(examDate, sessionDate)) {
        return false;
      }
      
      // For exams on the same day, check if they're in a later time block
      if (areSameDay(examDate, sessionDate)) {
        const examTimeOrder = timeOrder[exam.timeOfDay || 'Morning'];
        // Allow revision for this subject only if its exam is in an earlier block of the day
        return examTimeOrder < currentTimeOrder;
      }
      
      return true;
    })
    .map(exam => exam.subject)
    .filter(subject => !excludedSubjects.has(subject));
}