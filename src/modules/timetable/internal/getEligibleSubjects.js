import { parseISO } from 'date-fns';
import { areSameDay } from './dateUtils';

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
  // Get times of day in sequential order
  const timeOrder = { 'Morning': 0, 'Afternoon': 1, 'Evening': 2 };
  const currentTimeOrder = timeOrder[block];

  // Check for subjects with exams in this exact slot
  const exactSlotKey = `${date}-${block}`;
  // Get subjects that have exams in this exact slot
  const subjectsWithExamInThisSlot = examSlots.has(exactSlotKey) ? examSlots.get(exactSlotKey) : [];
  
  // Initialize a set to keep track of excluded subjects
  const excludedSubjects = new Set(subjectsWithExamInThisSlot);
  
  // Find exams on this day to determine which subjects are excluded
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
  
  // Exclude subjects with exams in later slots on the same day
  sameDay.forEach(({ block: examBlock, timeOrder: examTimeOrder, subjects }) => {
    // Only exclude subjects with exams in later blocks on the same day
    if (examTimeOrder > currentTimeOrder) {
      subjects.forEach(subject => excludedSubjects.add(subject));
    }
  });
  
  const sessionDate = parseISO(date);
  
  // Filter subjects that haven't had their exam yet OR have had it earlier this day
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