import { sortExams, mapExamDates, initializeAssignedCount } from "./examUtils.js";
import { sortBlankSessions, getAvailableSubjects, chooseSubject } from "./sessionUtils.js";
import { parseISO } from "date-fns";
import { enforcePreExamSession } from "./enforcePreExamSession.js";

/**
 * generateTimetableImproved
 * Fills all blank sessions with subjects according to a balanced distribution:
 * 1) Sorts blank sessions in chronological order.
 * 2) For each blank session, picks a subject among those whose exam date is >= that day.
 * 3) Chooses the subject with the fewest assigned sessions so far, to distribute study time evenly.
 * 4) After finalSessions is built, we enforce the "pre-exam session" rule by calling enforcePreExamSession.
 * 5) Returns an array of session objects: { date, block, subject }.
 */
export function generateTimetableImproved(
  userExams,
  userPreferences,
  revisionTimesResult,
  blankSessions
) {
  const sortedExams = sortExams(userExams);
  const examDatesMap = mapExamDates(sortedExams);
  const assignedCount = initializeAssignedCount(examDatesMap);
  const sortedBlankSessions = sortBlankSessions(blankSessions);

  const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
  const examMap = sortedExams.reduce((acc, exam) => {
    const dateStr = exam.examDate;
    if (!acc[dateStr]) acc[dateStr] = {};
    acc[dateStr][exam.subject] = exam.timeOfDay;
    return acc;
  }, {});

  const finalSessions = [];

  for (const session of sortedBlankSessions) {
    const sessionDateObj = parseISO(session.date);
    const availableSubjects = getAvailableSubjects(examDatesMap, sessionDateObj);

    if (!availableSubjects.length) {
      continue;
    }

    const filteredSubjects = availableSubjects.filter((subj) => {
      const examTimeOfDay = examMap[session.date]?.[subj];
      if (!examTimeOfDay) {
        return true;
      }
      const sessionBlockPriority = blockOrder[session.block];
      const examBlockPriority = blockOrder[examTimeOfDay];
      return examBlockPriority > sessionBlockPriority;
    });

    if (!filteredSubjects.length) {
      continue;
    }

    const chosenSubject = chooseSubject(filteredSubjects, assignedCount);
    finalSessions.push({
      date: session.date,
      block: session.block,
      subject: chosenSubject,
    });

    assignedCount[chosenSubject] = (assignedCount[chosenSubject] || 0) + 1;
  }

  // Enforce the "pre-exam session" rule before returning
  enforcePreExamSession(finalSessions, userExams);

  return finalSessions;
}