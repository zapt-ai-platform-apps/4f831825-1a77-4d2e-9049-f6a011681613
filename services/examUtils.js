import { parseISO } from "date-fns";

export function sortExams(userExams) {
  return [...userExams].sort(
    (a, b) => new Date(a.examDate) - new Date(b.examDate)
  );
}

export function mapExamDates(sortedExams) {
  return sortedExams.map((exam) => ({
    ...exam,
    examDateObj: parseISO(exam.examDate),
  }));
}

export function initializeAssignedCount(examDatesMap) {
  const assignedCount = {};
  examDatesMap.forEach((exam) => {
    if (!assignedCount[exam.subject]) {
      assignedCount[exam.subject] = 0;
    }
  });
  return assignedCount;
}