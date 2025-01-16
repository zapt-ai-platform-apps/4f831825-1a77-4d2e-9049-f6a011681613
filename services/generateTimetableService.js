import { authenticateUser } from "../api/_apiUtils.js";
import { db } from "../utils/dbClient.js";
import {
  deleteGeneratedTimetableEntries,
  getUserPreferences,
  getUserExams,
  getUserRevisionTimes,
  insertTimetableEntries,
} from "../utils/dataAccess.js";
import { buildBlankSessions } from "./timetableSessionBuilder.js";
import { generateAndSaveTimetable } from "./timetableGenerator.js";
import * as Sentry from "@sentry/node";

/**
 * generateTimetableHandler
 * 1) Deletes non-user-created timetable entries
 * 2) Builds an array of blank sessions [date, block, subject=""]
 *    using the user’s preferences (start date, chosen blocks)
 * 3) Calls ChatGPT with only the blank sessions + exam data
 * 4) Stores the generated timetable
 */
export async function generateTimetableHandler(req, res, Sentry) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    // Delete existing generated timetable entries (exclude user-created entries)
    await deleteGeneratedTimetableEntries(db, user.id);

    // Fetch user's exams, preferences, and revision times
    const userPreferences = await getUserPreferences(db, user.id);
    const userExams = await getUserExams(db, user.id);
    const revisionTimesResult = await getUserRevisionTimes(db, user.id);

    if (!userPreferences) {
      return res.status(400).json({ error: "User preferences not found" });
    }

    if (!userExams.length) {
      return res.status(400).json({ error: "No exams found for user" });
    }

    if (!revisionTimesResult.length) {
      return res.status(400).json({ error: "No revision times found for user" });
    }

    // Build array of blank sessions (date/block/subject="")
    const blankSessions = buildBlankSessions(userPreferences, userExams, revisionTimesResult);

    // Generate and save timetable using ChatGPT
    await generateAndSaveTimetable(db, user, userExams, blankSessions);

    res.status(200).json({ message: "Timetable generated via ChatGPT" });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error generating timetable:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}