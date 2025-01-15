export function mapExamsByDateBlock(exams) {
  const examsByDateBlock = {};
  exams.forEach((exam) => {
    const date = exam.examDate;
    const block = exam.block;
    if (!examsByDateBlock[date]) {
      examsByDateBlock[date] = {};
    }
    if (!examsByDateBlock[date][block]) {
      examsByDateBlock[date][block] = [];
    }
    examsByDateBlock[date][block].push(exam);
  });
  return examsByDateBlock;
}

export function mapRevisionTimesByDay(revisionTimes) {
  const revisionTimesMap = {};
  revisionTimes.forEach((rev) => {
    revisionTimesMap[rev.day] = rev.times;
  });
  return revisionTimesMap;
}