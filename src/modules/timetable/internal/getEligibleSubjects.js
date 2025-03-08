import { parseISO, isBefore, isAfter } from 'date-fns';

/**
 * Gets eligible subjects for a specific date and block
 * Considers exam proximity, fairness in distribution, and excludes subjects with exams same day
 * 
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {Array} exams - Array of exam objects
 * @param {Object} subjectCounts - Count of sessions per subject
 * @param {Map} examSlots - Map of exam slots
 * @returns {Array} Array of eligible subject names
 */
export function getEligibleSubjects(date, block, exams, subjectCounts, examSlots) {
  // If no exams, no eligible subjects
  if (!exams || exams.length === 0) {
    return [];
  }
  
  // Check if this timeslot has an exam
  const slotKey = `${date}-${block}`;
  if (examSlots.has(slotKey)) {
    return [];
  }
  
  const dateObj = parseISO(date);
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date passed to getEligibleSubjects:', date);
    return [];
  }

  // Time of day mapping for comparison (earlier = lower number)
  const timeOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
  const currentBlockOrder = timeOrder[block];
  
  // Filter out subjects with exams on this day at a later time
  // This prevents scheduling revision for a subject that has an exam later the same day
  const eligibleSubjects = exams.filter(exam => {
    if (!exam.examDate) return false;
    
    // If exam is on the same day
    if (exam.examDate === date) {
      const examBlockOrder = timeOrder[exam.timeOfDay || 'Morning'];
      
      // Only allow revision if the exam is earlier in the day (already completed)
      return examBlockOrder < currentBlockOrder;
    }
    
    // Exams on other days are eligible
    return true;
  }).map(exam => exam.subject);
  
  return [...new Set(eligibleSubjects)]; // Remove duplicates
}