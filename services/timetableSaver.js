import { insertTimetableEntries } from "../utils/dataAccess.js";

export async function saveTimetable(db, userId, finalTimetable) {
  const timetableData = finalTimetable.map((entry) => ({
    userId,
    date: entry.date,
    block: entry.block,
    subject: entry.subject,
    startTime: null,
    endTime: null,
    isUserCreated: false,
  }));

  await insertTimetableEntries(db, timetableData);
}