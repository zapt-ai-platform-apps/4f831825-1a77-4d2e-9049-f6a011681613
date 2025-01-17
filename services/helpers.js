import { getPreviousDateStr } from './utils.js';

export function groupSessionsByDate(sessions) {
  return sessions.reduce((acc, session) => {
    if (!acc[session.date]) {
      acc[session.date] = [];
    }
    acc[session.date].push(session);
    return acc;
  }, {});
}

export function groupExamsByDate(exams) {
  return exams.reduce((acc, exam) => {
    if (!acc[exam.date]) {
      acc[exam.date] = [];
    }
    acc[exam.date].push(exam);
    return acc;
  }, {});
}

export function updateSessionSubject(session, subject) {
  session.subject = subject;
}

export function updatePreviousDayEveningSession(
  sessionsByDate,
  examsByDate,
  finalSessions,
  exam,
  currentDateStr
) {
  const previousDateStr = getPreviousDateStr(currentDateStr);
  const previousSessions = sessionsByDate[previousDateStr] || [];

  const eveningSession = previousSessions.find(
    (sesh) => sesh.block === 'Evening'
  );

  const hasExamInEvening = (examsByDate[previousDateStr] || []).some(
    (ex) => ex.timeOfDay === 'Evening'
  );

  if (
    eveningSession &&
    !hasExamInEvening &&
    (!eveningSession.forcedSubject ||
      eveningSession.forcedSubject === exam.subject)
  ) {
    updateSessionSubject(eveningSession, exam.subject);
  }
}