import { blockPriority } from '../constants.js';
import { getPreviousDateStr } from '../dateUtils.js';

/**
 * Updates a session's subject.
 */
export function updateSessionSubject(session, subject) {
  session.subject = subject;
}

/**
 * Updates the previous day's evening session, if applicable.
 */
export function updatePreviousDayEveningSession(sessionsByDate, examsByDate, finalSessions, exam, dateStr) {
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
      updateSessionSubject(eveningSession, exam.subject);
    }
  }
}