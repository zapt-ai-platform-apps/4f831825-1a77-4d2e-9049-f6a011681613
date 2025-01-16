export function getSortedSubjects(userExams) {
  const subjectsWithDates = userExams.map((exam) => ({
    subject: exam.subject,
    examDate: new Date(exam.examDate),
  }));

  const subjectMap = {};
  for (const item of subjectsWithDates) {
    if (!subjectMap[item.subject]) {
      subjectMap[item.subject] = item.examDate;
    } else {
      if (item.examDate < subjectMap[item.subject]) {
        subjectMap[item.subject] = item.examDate;
      }
    }
  }

  const sortedSubjects = Object.keys(subjectMap).map((subject) => ({
    subject,
    examDate: subjectMap[subject],
  })).sort((a, b) => a.examDate - b.examDate);

  return sortedSubjects;
}