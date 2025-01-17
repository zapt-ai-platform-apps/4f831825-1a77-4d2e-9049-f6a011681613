import { parseISO } from "date-fns";
import { sortExams, mapExamDates, initializeAssignedCount } from "./examUtils.js";
import { enforcePreExamSession } from "./enforcePreExamSession.js";

/**
 * generateTimetableImproved
 * Implements a backward-filling approach:
 *
 * 1) Sort blank sessions from the latest date to the earliest date.
 * 2) Keep track of how many sessions each exam subject has been allocated.
 *    - We ensure exams occurring sooner do not lose out on revision slots to exams far in the future.
 * 3) Assign revision sessions by choosing from exams whose exam date >= session date.
 *    - Distribute sessions fairly, so no exam hogs too many sessions.
 * 4) Respect the immediate pre-exam slot requirement (handled by enforcePreExamSession).
 * 5) Handle consecutive exams by ensuring each exam can have a preceding session or fallback to the prior day’s Evening block.
 * 6) Return the final array of session objects: { date, block, subject }.
 */
export function generateTimetableImproved(
  userExams,
  userPreferences,
  revisionTimesResult,
  blankSessions
) {
  // Prep exam data
  const sortedExams = sortExams(userExams);
  const examDatesMap = mapExamDates(sortedExams);
  const assignedCount = initializeAssignedCount(examDatesMap);

  // Block priority needed for ensuring we only place a subject if the session's block precedes the exam's block on the same day
  const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };

  // Build a quick mapping of exam date → subject → timeOfDay
  const examMap = sortedExams.reduce((acc, exam) => {
    const dateStr = exam.examDate;
    if (!acc[dateStr]) acc[dateStr] = {};
    acc[dateStr][exam.subject] = exam.timeOfDay;
    return acc;
  }, {});

  // 1) Sort blank sessions from latest to earliest date (and also by block descending within the same date)
  const sortedBlankSessions = [...blankSessions].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateB - dateA !== 0) {
      return dateB - dateA; // descending by date
    }
    return blockOrder[b.block] - blockOrder[a.block]; // descending by block
  });

  const finalSessions = [];

  // 2) Distribute sessions in descending date order
  for (const session of sortedBlankSessions) {
    const sessionDateObj = parseISO(session.date);

    // ADD check to skip session if an exam exists in the same block
    const examFoundInSameBlock = userExams.some(
      (exam) => exam.examDate === session.date && exam.timeOfDay === session.block
    );
    if (examFoundInSameBlock) {
      continue; // Skip this block entirely (go to next session)
    }

    // Filter available exam subjects that have examDate >= session date
    const availableSubjects = examDatesMap.filter((exam) => {
      return exam.examDateObj >= sessionDateObj;
    }).map((exam) => exam.subject);

    if (!availableSubjects.length) {
      continue;
    }

    // We only assign if the session block is strictly before the exam block on the same day
    // If there's an exam on session.date with a block earlier or equal, skip that subject
    const filteredSubjects = availableSubjects.filter((subject) => {
      const examTimeOfDay = examMap[session.date]?.[subject];
      if (!examTimeOfDay) {
        return true; // no same-day exam or examTimeOfDay unknown
      }
      const sessionBlockPriority = blockOrder[session.block];
      const examBlockPriority = blockOrder[examTimeOfDay];
      return examBlockPriority > sessionBlockPriority;
    });

    if (!filteredSubjects.length) {
      continue;
    }

    // Among valid subjects, pick the one with the fewest assigned sessions so far
    let chosenSubject = null;
    let minCount = Infinity;
    for (const subj of filteredSubjects) {
      const count = assignedCount[subj] || 0;
      if (count < minCount) {
        minCount = count;
        chosenSubject = subj;
      }
    }

    finalSessions.push({
      date: session.date,
      block: session.block,
      subject: chosenSubject,
    });

    assignedCount[chosenSubject] = (assignedCount[chosenSubject] || 0) + 1;
  }

  // 3) Enforce the "pre-exam session" rule
  enforcePreExamSession(finalSessions, userExams);

  return finalSessions;
}