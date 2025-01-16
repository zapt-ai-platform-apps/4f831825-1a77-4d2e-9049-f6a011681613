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

  // Build fast lookup of exams by day/block
  const examsByDayBlock = userExams.reduce((acc, exam) => {
    const dateStr = format(parseISO(exam.examDate), "yyyy-MM-dd");
    if (!acc[dateStr]) {
      acc[dateStr] = { Morning: [], Afternoon: [], Evening: [] };
    }
    acc[dateStr][exam.timeOfDay].push(exam);
    return acc;
  }, {});

  for (const day of allDays) {
    const dayOfWeek = day.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    const blocksForThisDay = revisionTimes
      .filter((rt) => rt.dayOfWeek.toLowerCase() === dayOfWeek)
      .map((rt) => rt.block);

    const dateStr = format(day, "yyyy-MM-dd");
    const filteredBlocks = blocksForThisDay.filter((block) => {
      const anyExamSameBlock = examsByDayBlock[dateStr]
        && examsByDayBlock[dateStr][block]
        && examsByDayBlock[dateStr][block].length > 0;
      return !anyExamSameBlock;
    });

    for (const block of filteredBlocks) {
      blankSessions.push({
        date: dateStr,
        block,
        subject: "",
      });
    }
  }

  return blankSessions;
}