import {
  deleteGeneratedTimetableEntries,
  getUserPreferences,
  getUserExams,
  getUserRevisionTimes,
} from "../utils/dataAccess.js";
import { buildBlankSessions } from "./timetableSessionBuilder.js";
import { generateTimetableLocally } from "./timetableLocalGenerator.js";
import { reviewTimetable } from "./timetableReviewer.js";
import { saveTimetable } from "./timetableSaver.js";
import * as Sentry from "@sentry/node";

/**
 * Processes the timetable generation steps:
 * 1) Deletes non-user-created timetable entries
 * 2) Fetches user data
 * 3) Builds blank sessions
 * 4) Generates timetable locally (with session IDs)
 * 5) Reviews timetable with ChatGPT
 * 6) Saves final timetable to database
 */
export async function processTimetableGeneration(db, userId) {
  // 1) Delete existing generated timetable entries (exclude user-created entries)
  await deleteGeneratedTimetableEntries(db, userId);

  // 2) Fetch user data
  const userPreferences = await getUserPreferences(db, userId);
  const userExams = await getUserExams(db, userId);
  const revisionTimesResult = await getUserRevisionTimes(db, userId);

  if (!userPreferences) {
    throw new Error("User preferences not found");
  }

  if (!userExams.length) {
    throw new Error("No exams found for user");
  }

  if (!revisionTimesResult.length) {
    throw new Error("No revision times found for user");
  }

  // 3) Build array of blank sessions (date/block/subject="")
  const blankSessions = buildBlankSessions(userPreferences, userExams, revisionTimesResult);

  // 4) Generate a timetable locally (now each session has an ID)
  const localTimetable = generateTimetableLocally(userExams, blankSessions);

  // 5) Review timetable with ChatGPT
  const finalTimetable = await reviewTimetable(userId, localTimetable);

  // 6) Save the final schedule to DB
  await saveTimetable(db, userId, finalTimetable);
}