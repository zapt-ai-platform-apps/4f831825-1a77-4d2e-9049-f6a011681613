import { getSortedSubjects } from './utils/subjects.js';
import { sortBlankSessions } from './utils/sessionSorter.js';

export function generateTimetableLocally(userExams, blankSessions) {
  const sortedSubjects = getSortedSubjects(userExams);
  const sortedSessions = sortBlankSessions(blankSessions);

  let lastSubject = null;
  let consecutiveCount = 0;

  const result = [];

  for (let i = 0; i < sortedSessions.length; i++) {
    const session = sortedSessions[i];
    const sessionDate = new Date(session.date);

    let assignedSubject = null;

    for (let s = 0; s < sortedSubjects.length; s++) {
      const candidate = sortedSubjects[s];
      const candidateExamDate = candidate.examDate;

      if (sessionDate >= candidateExamDate) {
        continue;
      }

      let violatesConsecutiveRule = false;

      if (candidate.subject === lastSubject) {
        if (consecutiveCount >= 2) {
          violatesConsecutiveRule = true;
        } else {
          if (result.length > 0) {
            const prevDay = result[result.length - 1].date;
            if (session.date === prevDay) {
              violatesConsecutiveRule = true;
            }
          }
        }
      }

      if (!violatesConsecutiveRule) {
        assignedSubject = candidate.subject;
        break;
      }
    }

    if (!assignedSubject) {
      for (let s = 0; s < sortedSubjects.length; s++) {
        const candidate = sortedSubjects[s];
        const candidateExamDate = candidate.examDate;
        if (sessionDate >= candidateExamDate) {
          continue;
        }
        if (candidate.subject === lastSubject && consecutiveCount >= 2) {
          continue;
        }
        assignedSubject = candidate.subject;
        break;
      }
    }

    if (!assignedSubject) {
      assignedSubject = lastSubject || sortedSubjects[0].subject;
    }

    if (assignedSubject === lastSubject) {
      consecutiveCount++;
    } else {
      lastSubject = assignedSubject;
      consecutiveCount = 1;
    }

    result.push({
      date: session.date,
      block: session.block,
      subject: assignedSubject,
    });
  }

  return result;
}