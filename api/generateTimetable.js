import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { preferences, exams, revisionTimes, timetableEntries } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

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
    await db.delete(timetableEntries).where(eq(timetableEntries.userId, user.id));

    // Fetch user's exams, preferences, and revision times
    const [prefsResult, examsResult, revisionTimesResult] = await Promise.all([
      db.select().from(preferences).where(eq(preferences.userId, user.id)),
      db.select().from(exams).where(eq(exams.userId, user.id)),
      db.select().from(revisionTimes).where(eq(revisionTimes.userId, user.id)),
    ]);

    if (!prefsResult.length) {
      return res.status(400).json({ error: "User preferences not found" });
    }

    const userPreferences = prefsResult[0];
    const userExams = examsResult;

    if (!userExams.length) {
      return res.status(400).json({ error: "No exams found for user" });
    }

    if (!revisionTimesResult.length) {
      return res.status(400).json({ error: "No revision times found for user" });
    }

    // Generate timetable entries
    const timetableData = generateTimetable(userPreferences, userExams, revisionTimesResult);

    // Save timetable entries
    if (timetableData.length > 0) {
      await db.insert(timetableEntries).values(timetableData);
    }

    res.status(200).json({ message: "Timetable generated successfully" });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error generating timetable:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

function generateTimetable(preferences, exams, revisionTimes) {
  const { startDate } = preferences;

  // Convert exams to a map for quick access
  const examsBySubject = {};
  exams.forEach((exam) => {
    examsBySubject[exam.subject] = exam;
  });

  // Get list of subjects
  const subjects = exams.map((exam) => exam.subject);

  // Get the end date as the date of the last exam
  const examDates = exams.map((exam) => new Date(exam.examDate));
  const lastExamDate = new Date(Math.max.apply(null, examDates));

  // Collect exam dates for quick lookup
  const examDatesSet = new Set(
    exams.map((exam) => new Date(exam.examDate).toISOString().split("T")[0])
  );

  const timetableEntries = [];

  // Create a map of revision times
  const revisionTimesMap = {};
  revisionTimes.forEach((item) => {
    const day = item.dayOfWeek.toLowerCase();
    if (!revisionTimesMap[day]) {
      revisionTimesMap[day] = [];
    }
    revisionTimesMap[day].push(item.block);
  });

  // Valid time blocks
  const validBlocks = ["Morning", "Afternoon", "Evening"];

  // Generate dates from startDate to lastExamDate
  let dateCursor = new Date(startDate);
  const endDate = lastExamDate;
  while (dateCursor <= endDate) {
    const currentDateStr = dateCursor.toISOString().split("T")[0];

    // Skip scheduling sessions on exam days
    if (examDatesSet.has(currentDateStr)) {
      dateCursor.setDate(dateCursor.getDate() + 1);
      continue;
    }

    // Get the day of week
    const dayOfWeek = dateCursor
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    // Get available blocks for that day
    const dayBlocks = revisionTimesMap[dayOfWeek] || [];
    const availableBlocks = dayBlocks.filter((block) => validBlocks.includes(block));

    if (availableBlocks.length === 0) {
      dateCursor.setDate(dateCursor.getDate() + 1);
      continue;
    }

    let sessionIndex = 0;
    for (const block of availableBlocks) {
      // Only schedule subjects whose exams are after or on this date
      const validSubjects = subjects.filter((subject) => {
        const examDate = new Date(examsBySubject[subject].examDate);
        return examDate >= dateCursor;
      });

      if (validSubjects.length === 0) {
        break;
      }

      const subjectIndex =
        (dateCursor.getDate() + sessionIndex) % validSubjects.length;
      const assignedSubject = validSubjects[subjectIndex];

      timetableEntries.push({
        userId: preferences.userId,
        date: currentDateStr,
        block: block,
        subject: assignedSubject,
      });

      sessionIndex++;
    }

    // Move to next day
    dateCursor.setDate(dateCursor.getDate() + 1);
  }

  return timetableEntries;
}