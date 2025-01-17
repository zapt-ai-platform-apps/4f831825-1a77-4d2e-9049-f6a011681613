import { blockPriority } from './constants';
import { getPreviousDateStr } from './dateUtils';

/**
 * enforcePreExamSession
 * For each exam, if there is no earlier exam in the same day for the immediately preceding block,
 * and there is a revision session that block, force that session’s subject to this exam’s subject.
 *
 * Extended logic:
 * 1) If exam is in the "Morning" block (or if no suitable same-day block can be found),
 *    look at the previous day's "Evening" block.
 * 2) If that block exists, is not an exam, and is not already forced to a different subject,
 *    then set that block’s subject to the current exam’s subject.
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
      let foundPrecedingBlock = false;

      // Try to find a preceding block in the same day
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
            foundPrecedingBlock = true;
            break;
          }
        }
        candidateBlockIndex -= 1;
      }

      // Fallback to previous day’s Evening block if:
      // 1) The exam is in the Morning block (examBlockIndex === 0), OR
      // 2) We didn't find a suitable block on the same day
      if ((examBlockIndex === 0 || !foundPrecedingBlock) && dateStr) {
        const prevDateStr = getPreviousDateStr(dateStr);
        const previousDayExams = examsByDate[prevDateStr] || [];
        const previousDaySessions = sessionsByDate[prevDateStr] || [];

        // Sort them by block as well
        previousDaySessions.sort(
          (a, b) => blockPriority[a.block] - blockPriority[b.block]
        );

        // Look specifically for the "Evening" block (blockPriority === 2)
        const eveningSession = previousDaySessions.find(
          (sesh) => blockPriority[sesh.block] === 2
        );

        if (eveningSession) {
          // Check if there's an exam in that block
          const hasExamInEvening = previousDayExams.some(
            (otherExam) => blockPriority[otherExam.timeOfDay] === 2
          );

          // If there's no exam in that block, enforce the subject
          if (!hasExamInEvening) {
            eveningSession.subject = exam.subject;
          }
        }
      }
    }
  }

  return finalSessions;
}