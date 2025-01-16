import { sortExams, mapExamDates, initializeAssignedCount } from "./examUtils";
import { sortBlankSessions, getAvailableSubjects, chooseSubject } from "./sessionUtils";
import { parseISO } from "date-fns";

/**
 * generateTimetableImproved
 * Fills all blank sessions with subjects according to a balanced distribution:
 * 1) Sorts blank sessions in chronological order.
 * 2) For each blank session, picks a subject among those whose exam date is >= that day.
 * 3) Chooses the subject with the fewest assigned sessions so far, to distribute study time evenly.
 * 4) Returns an array of session objects: { date, block, subject }.
 */
export function generateTimetableImproved(
  userExams,
  userPreferences,
  revisionTimesResult,
  blankSessions
) {
  // Sort exams by date
  const sortedExams = sortExams(userExams);

  // Convert examDate strings to actual Date objects for comparisons
  const examDatesMap = mapExamDates(sortedExams);

  // Keep track of how many sessions each subject has been assigned
  const assignedCount = initializeAssignedCount(examDatesMap);

  // Sort blank sessions by date (and optionally by block priority: Morning < Afternoon < Evening)
  const sortedBlankSessions = sortBlankSessions(blankSessions);

  const finalSessions = [];

  for (const session of sortedBlankSessions) {
    const sessionDateObj = parseISO(session.date);

    // Filter the subjects that still have an exam date >= session date
    const availableSubjects = getAvailableSubjects(examDatesMap, sessionDateObj);

    // If no subjects are available, skip assigning
    if (!availableSubjects.length) {
      continue;
    }

    // Choose the subject with the fewest assigned sessions
    const chosenSubject = chooseSubject(availableSubjects, assignedCount);

    // Assign the chosen subject
    finalSessions.push({
      date: session.date,
      block: session.block,
      subject: chosenSubject,
    });

    // Increment assigned count
    assignedCount[chosenSubject] = (assignedCount[chosenSubject] || 0) + 1;
  }

  return finalSessions;
}