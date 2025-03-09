import { parseISO, addDays, isBefore, isAfter } from 'date-fns';
import { getDayOfWeek } from './dateUtils';

/**
 * Determines which subjects are eligible for scheduling in a given slot
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {Array} exams - Array of exam objects
 * @param {Object} subjectCounts - Object tracking number of sessions per subject
 * @param {Map} examSlots - Map of exam slots
 * @returns {Array} Array of eligible subject names
 */
export function getEligibleSubjects(date, block, exams, subjectCounts, examSlots) {
  if (!date || !block || !exams || !Array.isArray(exams) || exams.length === 0) {
    return [];
  }

  const currentDate = parseISO(date);
  const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
  const currentSlotKey = `${date}-${block}`;
  
  // Check if this slot is available (no exam scheduled)
  if (examSlots.has(currentSlotKey)) {
    console.log(`Slot ${date} ${block} has an exam scheduled, no subjects eligible`);
    return [];
  }
  
  const eligibleSubjects = [];
  
  // Check each subject (from each exam)
  exams.forEach(exam => {
    const examDate = parseISO(exam.examDate);
    const examSubject = exam.subject;
    const examBlock = exam.timeOfDay || 'Morning';
    
    // Skip subjects that have already had exams
    if (isBefore(examDate, currentDate)) {
      return;
    }
    
    // For exams on the same day, only schedule revision before the exam
    if (date === exam.examDate) {
      // If exam is in a later block on the same day, we can schedule revision
      if (blockOrder[block] < blockOrder[examBlock]) {
        eligibleSubjects.push(examSubject);
      }
      return;
    }
    
    // For exams on the day after, don't schedule morning revision
    const dayBefore = addDays(examDate, -1);
    if (date === dayBefore.toISOString().split('T')[0] && block === 'Morning') {
      return;
    }
    
    // All other cases - subject is eligible
    eligibleSubjects.push(examSubject);
  });
  
  // Remove duplicates
  const uniqueSubjects = [...new Set(eligibleSubjects)];
  
  // Check count balance - strongly prioritize subjects with fewer sessions
  if (uniqueSubjects.length >= 2) {
    console.log(`Evaluating subject balance for ${date} ${block}:`, 
      uniqueSubjects.map(s => `${s} (${subjectCounts[s] || 0} sessions)`));
    
    // Get min count to prioritize subjects that need more revision
    const minCount = Math.min(...uniqueSubjects.map(s => subjectCounts[s] || 0));
    
    // If we have subjects with significantly fewer sessions, prioritize those
    const prioritySubjects = uniqueSubjects.filter(s => (subjectCounts[s] || 0) === minCount);
    
    if (prioritySubjects.length > 0) {
      console.log(`Prioritizing subjects with fewer sessions (${minCount}):`, prioritySubjects);
      return prioritySubjects;
    }
  }
  
  return uniqueSubjects;
}