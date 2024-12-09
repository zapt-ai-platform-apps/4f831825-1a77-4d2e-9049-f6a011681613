import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import {
  preferences,
  exams,
  revisionTimes,
  timetableEntries,
} from "../drizzle/schema.js";
import { eq } from "drizzle-orm";
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

    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // Delete existing timetable entries
    await db
      .delete(timetableEntries)
      .where(eq(timetableEntries.userId, user.id));

    // Fetch user's exams, preferences, and revision times
    const [prefsResult, examsResult, revisionTimesResult] = await Promise.all([
      db
        .select()
        .from(preferences)
        .where(eq(preferences.userId, user.id))
        .limit(1),
      db
        .select()
        .from(exams)
        .where(eq(exams.userId, user.id)),
      db
        .select()
        .from(revisionTimes)
        .where(eq(revisionTimes.userId, user.id)),
    ]);

    if (!prefsResult.length) {
      return res.status(400).json({ error: "User preferences not found" });
    }

    const userPreferences = prefsResult[0];
    userPreferences.userId = user.id;

    const userExams = examsResult;

    if (!userExams.length) {
      return res.status(400).json({ error: "No exams found for user" });
    }

    if (!revisionTimesResult.length) {
      return res.status(400).json({ error: "No revision times found for user" });
    }

    // Generate timetable entries
    const timetableData = generateTimetable(
      userPreferences,
      userExams,
      revisionTimesResult
    );

    // Save timetable entries
    if (timetableData && timetableData.length > 0) {
      await db.insert(timetableEntries).values(timetableData);
    }

    res.status(200).json({ message: "Timetable generated successfully" });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error generating timetable:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}