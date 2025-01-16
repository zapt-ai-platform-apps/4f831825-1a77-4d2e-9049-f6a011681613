const blockPriority = { Morning: 0, Afternoon: 1, Evening: 2 };

/**
 * enforcePreExamSession
 * For each exam, if there is no earlier exam in the same day for the immediately preceding block,
 * and there is a revision session that block, force that session’s subject to this exam’s subject.
 */
export function enforcePreExamSession(finalSessions, userExams) {
  // Group sessions by date, also group exams by date
  const sessionsByDate = {};
  for (const session of finalSessions) {
    if (!sessionsByDate[session.date]) sessionsByDate[session.date] = [];
    sessionsByDate[session.date].push(session);
  }

  const examsByDate = {};
  for (const exam of userExams) {
    const dateStr = exam.examDate;
    if (!examsByDate[dateStr]) examsByDate[dateStr] = [];
    examsByDate[dateStr].push(exam);
  }

  // Sort each day’s exams by block (Morning=0, Afternoon=1, Evening=2)
  for (const dateStr in examsByDate) {
    examsByDate[dateStr].sort((a, b) => {
      return blockPriority[a.timeOfDay] - blockPriority[b.timeOfDay];
    });
  }

  // For each date, enforce the rule
  for (const dateStr in examsByDate) {
    const dailyExams = examsByDate[dateStr];
    const dailySessions = sessionsByDate[dateStr] || [];

    // Sort daily sessions by block
    dailySessions.sort((a, b) => blockPriority[a.block] - blockPriority[b.block]);

    for (const exam of dailyExams) {
      const examBlockIndex = blockPriority[exam.timeOfDay];
      // Find the immediately preceding block that is NOT an exam
      // but is a revision session in finalSessions
      let candidateBlockIndex = examBlockIndex - 1;
      while (candidateBlockIndex >= 0) {
        // Check if there is an exam in candidateBlockIndex
        const hasExamInCandidate = dailyExams.some(
          (otherExam) =>
            blockPriority[otherExam.timeOfDay] === candidateBlockIndex
        );
        if (!hasExamInCandidate) {
          // We found a revision block. Force that session to the exam’s subject
          const sessionToUpdate = dailySessions.find(
            (sesh) => blockPriority[sesh.block] === candidateBlockIndex
          );
          if (sessionToUpdate) {
            sessionToUpdate.subject = exam.subject;
            // Only enforce for the immediate preceding block, then stop
            break;
          }
        }
        candidateBlockIndex -= 1;
      }
    }
  }

  return finalSessions;
}