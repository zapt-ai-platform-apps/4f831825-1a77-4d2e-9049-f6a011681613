import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import { db } from "../utils/dbClient.js";
import { timetables } from "../drizzle/schema.js";

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

    const body = req.body;
    const { data: timetableData } = body;

    if (!timetableData) {
      return res.status(400).json({ error: "Timetable data is required" });
    }

    await db
      .insert(timetables)
      .values({
        userId: user.id,
        data: timetableData,
      })
      .onConflictDoUpdate({
        target: timetables.userId,
        set: {
          data: timetableData,
        },
      });

    res.status(200).json({ message: "Timetable saved" });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error saving timetable:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}