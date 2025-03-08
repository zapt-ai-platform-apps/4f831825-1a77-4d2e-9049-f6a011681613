import { parseISO, isBefore, isAfter, isSameDay } from 'date-fns';

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
  
  // Filter exams to find eligible subjects
  const eligibleSubjects = exams.filter(exam => {
    if (!exam.examDate) return false;
    
    const examDateObj = parseISO(exam.examDate);
    
    // For exams on the same day as the session
    if (isSameDay(examDateObj, dateObj)) {
      // Only include subjects where the exam is earlier in the day than the current block
      const examBlockOrder = timeOrder[exam.timeOfDay || 'Morning'];
      return examBlockOrder < currentBlockOrder;
    }
    
    // For exams on other days:
    // FIXED: Include only subjects with upcoming exams (exclude past exams)
    return isAfter(examDateObj, dateObj);
  }).map(exam => exam.subject);
  
  return [...new Set(eligibleSubjects)]; // Remove duplicates
}