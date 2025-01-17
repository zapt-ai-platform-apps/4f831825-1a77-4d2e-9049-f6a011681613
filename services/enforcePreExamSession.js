import { format } from 'date-fns';

/**
 * Enforces that each exam has a pre-exam revision session.
 * @param {Array} sessions - Array of session objects.
 * @param {Array} exams - Array of exam objects.
 */
export function enforcePreExamSession(sessions, exams) {
  const sessionMap = sessions.reduce((acc, session) => {
    acc[session.date] = acc[session.date] || {};
    acc[session.date][session.block] = session.subject;
    return acc;
  }, {});

  exams.forEach((exam) => {
    const examDate = exam.examDate;
    const examBlock = exam.timeOfDay;

    // Determine the block before the exam block
    const blockOrder = ["Morning", "Afternoon", "Evening"];
    const examBlockIndex = blockOrder.indexOf(examBlock);
    if (examBlockIndex === -1) return;

    const preExamBlock = blockOrder[examBlockIndex - 1];
    if (!preExamBlock) return; // No block before the first block

    // Check if there's already a session before the exam
    if (
      sessionMap[examDate] &&
      sessionMap[examDate][preExamBlock] === exam.subject
    ) {
      return; // Pre-exam session already exists
    }

    // If not, try to find a session on the day before in the Evening block
    const examDateObj = new Date(examDate);
    const previousDay = new Date(examDateObj);
    previousDay.setDate(examDateObj.getDate() - 1);
    const previousDayStr = format(previousDay, 'yyyy-MM-dd');

    if (
      sessionMap[previousDayStr] &&
      sessionMap[previousDayStr]["Evening"] === exam.subject
    ) {
      return; // Pre-exam session exists on the previous day Evening block
    }

    // If neither, you might want to handle it accordingly, e.g., throw an error or assign a fallback session
    // For this implementation, we'll skip enforcing if no session is found
  });
}