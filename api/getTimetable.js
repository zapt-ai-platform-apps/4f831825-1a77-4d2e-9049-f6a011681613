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

    // Fetch timetable entries
    const result = await db
      .select()
      .from(timetableEntries)
      .where(eq(timetableEntries.userId, user.id));

    // Format the timetable data by date
    const timetableByDate = {};
    for (const entry of result) {
      if (!timetableByDate[entry.date]) {
        timetableByDate[entry.date] = [];
      }
      timetableByDate[entry.date].push({
        block: entry.block,
        subject: entry.subject,
        startTime: entry.startTime ? entry.startTime.slice(0, 5) : null,
        endTime: entry.endTime ? entry.endTime.slice(0, 5) : null,
        isUserCreated: entry.isUserCreated,
        isComplete: entry.isComplete
      });
    }

    // Fetch period-specific availability data
    const periodAvailabilityResult = await db
      .select()
      .from(periodSpecificAvailability)
      .where(eq(periodSpecificAvailability.userId, user.id));

    // Process period-specific availability data
    const periodAvailability = [];
    
    // Group by start and end dates
    const periodsByDate = {};
    for (const row of periodAvailabilityResult) {
      const key = `${row.startDate}-${row.endDate}`;
      if (!periodsByDate[key]) {
        periodsByDate[key] = {
          startDate: row.startDate,
          endDate: row.endDate,
          revisionTimes: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
          }
        };
      }
      
      if (row.isAvailable) {
        periodsByDate[key].revisionTimes[row.dayOfWeek].push(row.block);
      }
    }

    // Convert to array
    for (const key in periodsByDate) {
      periodAvailability.push(periodsByDate[key]);
    }

    res.status(200).json({ 
      data: timetableByDate, 
      periodAvailability 
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching timetable:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}