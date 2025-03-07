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
  const sessionDate = parseISO(date);
  
  // Check if there's any exam in this slot
  const slotKey = `${date}-${block}`;
  if (examSlots.has(slotKey)) {
    return [];
  }
  
  // Get times of day in sequential order
  const timeOrder = { 'Morning': 0, 'Afternoon': 1, 'Evening': 2 };
  const currentTimeOrder = timeOrder[block];
  
  // Find exams on this day to exclude their subjects from revision
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
  sameDay.forEach(({ block: examBlock, timeOrder: examTimeOrder, subjects }) => {
    // Exclude subjects with exams in later blocks on the same day
    if (examTimeOrder > currentTimeOrder) {
      subjects.forEach(subject => excludedSubjects.add(subject));
    }
  });
  
  // Filter subjects that haven't had their exam yet (or have had it earlier this day)
  return exams
    .filter(exam => {
      const examDate = parseISO(exam.examDate);
      
      // Exclude subjects whose exams have already passed on previous days
      if (isBefore(examDate, sessionDate) && !isSameDay(examDate, sessionDate)) {
        return false;
      }
      
      // For exams on the same day, check if they're in a later time block
      if (isSameDay(examDate, sessionDate)) {
        const examTimeOrder = timeOrder[exam.timeOfDay || 'Morning'];
        // Allow revision for this subject only if its exam is in an earlier block
        // Changed from <= to < to fix the test failure
        return examTimeOrder < currentTimeOrder;
      }
      
      return true;
    })
    .map(exam => exam.subject)
    .filter(subject => !excludedSubjects.has(subject));
}