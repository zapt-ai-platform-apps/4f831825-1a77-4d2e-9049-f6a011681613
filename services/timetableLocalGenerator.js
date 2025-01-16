import { getSortedSubjects } from './utils/subjects.js';
import { sortBlankSessions } from './utils/sessionSorter.js';
import { randomUUID } from 'crypto';

export function generateTimetableLocally(userExams, blankSessions) {
  const sortedSubjects = getSortedSubjects(userExams);
  const sortedSessions = sortBlankSessions(blankSessions);

  // Build a counter to track how many sessions each subject has
  const subjectAssignments = {};
  for (const s of sortedSubjects) {
    subjectAssignments[s.subject] = 0;
  }

  let lastSubject = null;
  let consecutiveCount = 0;
  const result = [];

  for (const session of sortedSessions) {
    const sessionDate = new Date(session.date);

    // 1) Filter out subjects whose examDate <= sessionDate
    const validSubjects = sortedSubjects.filter(
      (candidate) => sessionDate < candidate.examDate
    );

    // 2) Among the valid subjects, choose the one with the fewest assignments
    //    that doesn't break the consecutive rule (if possible).
    let chosenSubject = null;
    let minCount = Infinity;

    for (const candidate of validSubjects) {
      const candidateSubject = candidate.subject;
      const countSoFar = subjectAssignments[candidateSubject];

      let violatesConsecutiveRule = false;
      if (candidateSubject === lastSubject && consecutiveCount >= 2) {
        violatesConsecutiveRule = true;
      }

      if (!violatesConsecutiveRule && countSoFar < minCount) {
        chosenSubject = candidateSubject;
        minCount = countSoFar;
      }
    }

    // If none could be chosen due to the consecutive rule, ignore that rule once
    if (!chosenSubject && validSubjects.length > 0) {
      chosenSubject = validSubjects.reduce(
        (lowest, c) =>
          subjectAssignments[c.subject] < subjectAssignments[lowest.subject] ? c : lowest
      ).subject;
    }

    // Fallback if still no subject found
    if (!chosenSubject) {
      chosenSubject = sortedSubjects[0].subject;
    }

    // Assign the chosen subject to this session
    result.push({
      id: randomUUID(),
      date: session.date,
      block: session.block,
      subject: chosenSubject,
    });
    subjectAssignments[chosenSubject]++;

    // Update consecutive subject tracking
    if (chosenSubject === lastSubject) {
      consecutiveCount++;
    } else {
      lastSubject = chosenSubject;
      consecutiveCount = 1;
    }
  }

  return result;
}