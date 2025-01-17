/**
 * Sorts the exams by examDate in ascending order.
 * @param {Array} userExams - Array of exam objects.
 * @returns {Array} - Sorted array of exam objects.
 */
export function sortExams(userExams) {
  return userExams.slice().sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
}

/**
 * Maps exam dates to their corresponding exam details.
 * @param {Array} sortedExams - Sorted array of exam objects.
 * @returns {Array} - Array of mapped exam objects with Date objects.
 */
export function mapExamDates(sortedExams) {
  return sortedExams.map(exam => ({
    ...exam,
    examDateObj: new Date(exam.examDate)
  }));
}

/**
 * Initializes the assigned count for each subject to zero.
 * @param {Array} examDatesMap - Array of mapped exam objects.
 * @returns {Object} - Object with subjects as keys and counts as values.
 */
export function initializeAssignedCount(examDatesMap) {
  const count = {};
  examDatesMap.forEach(exam => {
    count[exam.subject] = 0;
  });
  return count;
}