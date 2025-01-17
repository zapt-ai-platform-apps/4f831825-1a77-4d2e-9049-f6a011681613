/**
 * Sort exams by examDate ascending.
 * @param {Array} exams - Array of exam objects.
 * @returns {Array} - Sorted array of exams.
 */
export function sortExams(exams) {
  return exams.slice().sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
}

/**
 * Map exam dates with their corresponding subjects and date objects.
 * @param {Array} sortedExams - Sorted array of exams.
 * @returns {Array} - Mapped exam dates.
 */
export function mapExamDates(sortedExams) {
  return sortedExams.map((exam) => ({
    subject: exam.subject,
    examDate: exam.examDate,
    examDateObj: new Date(exam.examDate),
  }));
}

/**
 * Initialize assigned count for each subject.
 * @param {Array} examDatesMap - Mapped exam dates.
 * @returns {Object} - Initialized count object.
 */
export function initializeAssignedCount(examDatesMap) {
  const count = {};
  examDatesMap.forEach((exam) => {
    count[exam.subject] = 0;
  });
  return count;
}