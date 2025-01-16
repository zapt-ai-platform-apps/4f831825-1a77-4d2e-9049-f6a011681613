import {
  deleteGeneratedTimetableEntries,
  getUserPreferences,
  getUserExams,
  getUserRevisionTimes,
  insertTimetableEntries,
} from "../utils/dataAccess.js";
import { buildBlankSessions } from "./timetableSessionBuilder.js";
import { generateTimetableLocally } from "./timetableLocalGenerator.js";
import { callChatGPTForReview } from "../utils/callChatGPTForReview.js";
import * as Sentry from "@sentry/node";

/**
 * Processes the timetable generation steps:
 * 1) Deletes non-user-created timetable entries
 * 2) Fetches user data
 * 3) Builds blank sessions
 * 4) Generates timetable locally
 * 5) Reviews with ChatGPT
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

  // Generate a timetable locally
  const localTimetable = generateTimetableLocally(userExams, blankSessions);

  // 4) Send locally generated timetable to ChatGPT for review
  let finalTimetable = localTimetable;
  try {
    const revisedTimetable = await callChatGPTForReview(userId, localTimetable);
    if (revisedTimetable && revisedTimetable.length > 0) {
      finalTimetable = revisedTimetable;
    }
  } catch (reviewError) {
    console.error("ChatGPT review failed, using local timetable:", reviewError);
    Sentry.captureException(reviewError);
  }

  // 5) Save the final schedule (local or revised)
  // Add any missing fields for the DB insert
  const timetableData = finalTimetable.map((entry) => ({
    userId: userId,
    date: entry.date,
    block: entry.block,
    subject: entry.subject,
    startTime: null,
    endTime: null,
    isUserCreated: false,
  }));

  await insertTimetableEntries(db, timetableData);
}