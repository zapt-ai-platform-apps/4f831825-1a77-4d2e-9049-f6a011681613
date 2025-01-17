/**
 * Groups sessions by date.
 */
export function groupSessionsByDate(finalSessions) {
  const sessionsByDate = {};
  for (const session of finalSessions) {
    if (!sessionsByDate[session.date]) sessionsByDate[session.date] = [];
    sessionsByDate[session.date].push(session);
  }
  return sessionsByDate;
}

/**
 * Groups exams by date.
 */
export function groupExamsByDate(userExams) {
  const examsByDate = {};
  for (const exam of userExams) {
    const dateStr = exam.examDate;
    if (!examsByDate[dateStr]) examsByDate[dateStr] = [];
    examsByDate[dateStr].push(exam);
  }
  return examsByDate;
}