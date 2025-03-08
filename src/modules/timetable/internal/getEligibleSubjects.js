import { parseISO, isAfter, isSameDay } from 'date-fns';

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
  
  const dateObj = parseISO(date);
  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date passed to getEligibleSubjects:', date);
    return [];
  }

  // Get subjects that have exams in this specific timeslot
  const slotKey = `${date}-${block}`;
  const subjectsWithExamsInThisSlot = examSlots.get(slotKey) || [];
  
  // If any exam is scheduled in this slot, return empty array immediately
  // This prevents scheduling revision sessions in slots with exams
  if (subjectsWithExamsInThisSlot.length > 0) {
    return [];
  }
  
  // Filter exams to find eligible subjects
  const eligibleSubjects = exams.filter(exam => {
    if (!exam.examDate) return false;
    
    const examDateObj = parseISO(exam.examDate);
    
    // CRITICAL: Never allow revision sessions for a subject on the same day as its exam
    // This prevents scheduling revision sessions on the day of the exam, regardless of time
    if (exam.examDate === date) {
      return false;
    }
    
    // For exams on other days:
    // Include only subjects with upcoming exams (exclude past exams)
    return isAfter(examDateObj, dateObj);
  }).map(exam => exam.subject);
  
  return [...new Set(eligibleSubjects)]; // Remove duplicates
}