export function sortExamsByDate(exams) {
  exams.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
}

export function mapExamsByDateBlock(exams) {
  const examsByDateBlock = {};
  exams.forEach((exam) => {
    const examDateStr = exam.examDate;
    const block = exam.timeOfDay || 'Morning';
    if (!examsByDateBlock[examDateStr]) {
      examsByDateBlock[examDateStr] = new Set();
    }
    examsByDateBlock[examDateStr].add(block);
  });
  return examsByDateBlock;
}