import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import { timetableEntries } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { db } from "./_dbClient.js";

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
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    const result = await db
      .select()
      .from(timetableEntries)
      .where(eq(timetableEntries.userId, user.id));

    if (!result.length) {
      // Return empty object instead of null so it doesn't trigger an error on the frontend
      return res.status(200).json({ data: {} });
    }

    // Group timetable entries by date
    const timetableData = {};
    result.forEach((entry) => {
      if (!timetableData[entry.date]) {
        timetableData[entry.date] = [];
      }
      timetableData[entry.date].push({
        block: entry.block,
        subject: entry.subject,
        startTime: entry.startTime,
        endTime: entry.endTime,
        isUserCreated: entry.isUserCreated,
      });
    });

    res.status(200).json({ data: timetableData });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching timetable:", error);
    res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
}