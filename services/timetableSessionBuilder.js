import { parseISO, format, eachDayOfInterval } from "date-fns";

/**
 * buildBlankSessions
 * Builds an array of blank sessions [date, block, subject=""]
 * using the user’s preferences (start date, chosen blocks) and exams.
 */
export function buildBlankSessions(userPreferences, userExams, revisionTimes) {
  // Determine range from startDate to last exam date
  const startDate = parseISO(userPreferences.startDate);
  const examDates = userExams.map((exam) => parseISO(exam.examDate));
  const lastExamDate = examDates.reduce((max, d) => (d > max ? d : max), startDate);

  const allDays = eachDayOfInterval({ start: startDate, end: lastExamDate });
  const blankSessions = [];

  for (const day of allDays) {
    // Convert day to e.g. "monday", "tuesday" ...
    const dayOfWeek = day.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    // Find blocks for this day
    const blocksForThisDay = revisionTimes
      .filter((rt) => rt.dayOfWeek.toLowerCase() === dayOfWeek)
      .map((rt) => rt.block);

    // For each block, push a blank session
    for (const block of blocksForThisDay) {
      blankSessions.push({
        date: format(day, "yyyy-MM-dd"),
        block,
        subject: "",
      });
    }
  }

  return blankSessions;
}