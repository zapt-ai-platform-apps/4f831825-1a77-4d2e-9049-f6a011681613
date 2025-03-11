import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import { db } from "./_dbClient.js";
import { timetableEntries } from "../drizzle/schema.js";
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
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    // Get all timetable entries for the user
    const entries = await db
      .select()
      .from(timetableEntries)
      .where(eq(timetableEntries.userId, user.id));

    console.log(`Retrieved ${entries.length} timetable entries for user ${user.id}`);

    // Group entries by date for easier consumption in the UI
    const groupedEntries = entries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return acc;
    }, {});

    res.status(200).json({
      data: groupedEntries
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching timetable:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}