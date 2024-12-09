import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import { db } from "../utils/dbClient.js";
import {
  deleteUserTimetableEntries,
  getUserPreferences,
  getUserExams,
  getUserRevisionTimes,
  getUserBlockTimes,
  insertTimetableEntries,
} from "../utils/dataAccess.js";
import { generateTimetable } from "../utils/generateTimetable.js";

Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
  initialScope: {
    tags: {
      type: "backend",
      projectId: process.env.VITE_PUBLIC_APP_ID,
    },
  },
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    // Delete existing timetable entries
    await deleteUserTimetableEntries(db, user.id);

    // Fetch user's exams, preferences, revision times, and block times
    const userPreferences = await getUserPreferences(db, user.id);
    const userExams = await getUserExams(db, user.id);
    const revisionTimesResult = await getUserRevisionTimes(db, user.id);
    const blockTimesData = await getUserBlockTimes(db, user.id);

    if (!userPreferences) {
      return res.status(400).json({ error: "User preferences not found" });
    }

    if (!userExams.length) {
      return res.status(400).json({ error: "No exams found for user" });
    }

    if (!revisionTimesResult.length) {
      return res.status(400).json({ error: "No revision times found for user" });
    }

    // Generate timetable entries
    const timetableData = await generateTimetable(
      userPreferences,
      userExams,
      revisionTimesResult,
      blockTimesData
    );

    // Save timetable entries
    if (timetableData && timetableData.length > 0) {
      await insertTimetableEntries(db, timetableData);
    }

    res.status(200).json({ message: "Timetable generated successfully" });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error generating timetable:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}