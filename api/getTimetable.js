import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
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

    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    const result = await db
      .select()
      .from(timetableEntries)
      .where(eq(timetableEntries.userId, user.id));

    if (!result.length) {
      return res.status(200).json({ data: null });
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
      });
    });

    res.status(200).json({ data: timetableData });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching timetable:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}