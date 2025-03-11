import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import { db } from "./_dbClient.js";
import { timetableEntries, periodSpecificAvailability } from "../drizzle/schema.js";
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

    // Get period-specific availability if any
    const specificAvailability = await db
      .select()
      .from(periodSpecificAvailability)
      .where(eq(periodSpecificAvailability.userId, user.id));

    console.log(`Retrieved ${specificAvailability.length} period-specific availability settings for user ${user.id}`);

    // Group entries by date for easier consumption in the UI
    const groupedEntries = entries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return acc;
    }, {});

    // Group availability settings by period for easier consumption in the UI
    const groupedAvailability = specificAvailability.reduce((acc, availability) => {
      const periodKey = `${availability.startDate}_${availability.endDate}`;
      if (!acc[periodKey]) {
        acc[periodKey] = {
          startDate: availability.startDate,
          endDate: availability.endDate,
          settings: []
        };
      }
      acc[periodKey].settings.push({
        dayOfWeek: availability.dayOfWeek,
        block: availability.block,
        isAvailable: availability.isAvailable
      });
      return acc;
    }, {});

    res.status(200).json({
      data: groupedEntries,
      periodAvailability: Object.values(groupedAvailability)
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching timetable:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}