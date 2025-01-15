export function sortExamsByDate(exams) {
  exams.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
}