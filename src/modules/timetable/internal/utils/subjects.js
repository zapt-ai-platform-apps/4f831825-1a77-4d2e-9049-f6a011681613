import { parseISO, isBefore, isAfter } from 'date-fns';

/**
 * Gets upcoming subjects based on current date
 * @param {Array} exams - Array of exam objects
 * @param {Date} date - Current date
 * @returns {Array} Array of upcoming subject names
 */
export function getUpcomingSubjects(exams, date = new Date()) {
  return exams
    .filter(exam => {
      const examDate = parseISO(exam.examDate);
      return isAfter(examDate, date);
    })
    .map(exam => exam.subject);
}

/**
 * Gets subjects with earliest exams
 * @param {Array} exams - Array of exam objects
 * @param {number} limit - Maximum number of subjects to return
 * @returns {Array} Array of subject names
 */
export function getEarliestExamSubjects(exams, limit = 3) {
  return [...exams]
    .sort((a, b) => {
      const dateA = parseISO(a.examDate);
      const dateB = parseISO(b.examDate);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, limit)
    .map(exam => exam.subject);
}

/**
 * Gets the next subject to study based on exams and already studied subjects
 * @param {Array} exams - Array of exam objects
 * @param {Array} studiedSubjects - Array of recently studied subject names
 * @returns {string} Subject name
 */
export function getNextSubjectToStudy(exams, studiedSubjects = []) {
  // Sort exams by date
  const sortedExams = [...exams].sort((a, b) => {
    const dateA = parseISO(a.examDate);
    const dateB = parseISO(b.examDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Get all subjects in order of exam date
  const subjectsInOrder = sortedExams.map(exam => exam.subject);
  
  // Filter out subjects that have been recently studied
  const availableSubjects = subjectsInOrder.filter(
    subject => !studiedSubjects.includes(subject)
  );
  
  // Return the first available subject or the least recently studied one
  return availableSubjects[0] || subjectsInOrder[0];
}

/**
 * Calculates study distribution for subjects based on exam proximity
 * @param {Array} exams - Array of exam objects
 * @param {number} totalSessions - Total number of sessions available
 * @returns {Object} Map of subjects to number of sessions
 */
export function calculateSubjectDistribution(exams, totalSessions) {
  if (!exams.length) return {};
  
  // Get unique subjects
  const subjects = [...new Set(exams.map(exam => exam.subject))];
  
  // Calculate relative weights based on exam proximity
  const today = new Date();
  const weights = subjects.map(subject => {
    // Find the earliest exam for this subject
    const earliestExam = exams
      .filter(exam => exam.subject === subject)
      .reduce((earliest, exam) => {
        const examDate = parseISO(exam.examDate);
        return !earliest || isBefore(examDate, earliest) 
          ? examDate 
          : earliest;
      }, null);
    
    if (!earliestExam) return { subject, weight: 1 };
    
    // Calculate days until exam (more weight for closer exams)
    const daysUntilExam = Math.max(
      1, 
      Math.ceil((earliestExam - today) / (1000 * 60 * 60 * 24))
    );
    
    // Weight is inverse of days until exam
    return { 
      subject, 
      weight: 1 / daysUntilExam
    };
  });
  
  // Normalize weights to sum to 1
  const totalWeight = weights.reduce((sum, { weight }) => sum + weight, 0);
  const normalizedWeights = weights.map(({ subject, weight }) => ({
    subject,
    weight: weight / totalWeight
  }));
  
  // Distribute sessions based on weights
  const distribution = {};
  
  // Initial distribution based on weights
  normalizedWeights.forEach(({ subject, weight }) => {
    distribution[subject] = Math.floor(weight * totalSessions);
  });
  
  // Distribute remaining sessions to subjects with highest remainder
  const remainingSessions = totalSessions - 
    Object.values(distribution).reduce((sum, count) => sum + count, 0);
  
  if (remainingSessions > 0) {
    const remainders = normalizedWeights.map(({ subject, weight }) => ({
      subject,
      remainder: (weight * totalSessions) - distribution[subject]
    }));
    
    remainders
      .sort((a, b) => b.remainder - a.remainder)
      .slice(0, remainingSessions)
      .forEach(({ subject }) => {
        distribution[subject]++;
      });
  }
  
  return distribution;
}