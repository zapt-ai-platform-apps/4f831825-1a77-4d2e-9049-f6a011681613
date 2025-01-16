import {
  deleteGeneratedTimetableEntries,
  getUserPreferences,
  getUserExams,
  getUserRevisionTimes,
} from "../utils/dataAccess.js";
import { buildBlankSessions } from "./timetableSessionBuilder.js";
import { generateTimetableLocally } from "./timetableLocalGenerator.js";
import { saveTimetable } from "./timetableSaver.js";
import * as Sentry from "@sentry/node";

/**
 * Processes the timetable generation steps:
 * 1) Deletes non-user-created timetable entries
 * 2) Fetches user data
 * 3) Builds blank sessions
 * 4) Generates timetable locally
 * 5) Saves timetable to the database (Skipping ChatGPT review)
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

  // 3) Build array of blank sessions
  const blankSessions = buildBlankSessions(userPreferences, userExams, revisionTimesResult);

  // 4) Generate a timetable locally (skipping ChatGPT final review)
  const localTimetable = generateTimetableLocally(userExams, blankSessions);

  // 5) Save the final schedule to the database (using localTimetable directly)
  await saveTimetable(db, userId, localTimetable);
}