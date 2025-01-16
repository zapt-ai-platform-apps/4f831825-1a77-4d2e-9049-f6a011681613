import { callChatGPTForTimetable } from "../utils/callChatGPTForTimetable.js";
import { insertTimetableEntries } from "../utils/dataAccess.js";

/**
 * generateAndSaveTimetable
 * Calls ChatGPT to generate the timetable and saves the entries to the database.
 */
export async function generateAndSaveTimetable(db, user, userExams, blankSessions) {
  // Prepare exam data for ChatGPT
  const examsData = userExams.map((e) => ({
    subject: e.subject,
    examDate: e.examDate,
    timeOfDay: e.timeOfDay,
  }));

  // Call ChatGPT (we do NOT pass userPreferences or revisionTimes)
  const timetableData = await callChatGPTForTimetable({
    userId: user.id,
    examsData,
    blankSessions,
  });

  // Save timetable entries
  if (timetableData && timetableData.length > 0) {
    await insertTimetableEntries(db, timetableData);
  }
}