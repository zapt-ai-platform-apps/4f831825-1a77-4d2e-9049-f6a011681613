import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import { db } from "./_dbClient.js";
import { preferences, revisionTimes, blockTimes, periodSpecificAvailability } from "../drizzle/schema.js";
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

    const preferencesResult = await db
      .select()
      .from(preferences)
      .where(eq(preferences.userId, user.id));

    if (!preferencesResult.length) {
      return res.status(200).json({ data: null });
    }

    const userPreferences = preferencesResult[0];

    const revisionTimesResult = await db
      .select()
      .from(revisionTimes)
      .where(eq(revisionTimes.userId, user.id));

    const revisionTimesData = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    for (const row of revisionTimesResult) {
      if (!revisionTimesData[row.dayOfWeek]) {
        revisionTimesData[row.dayOfWeek] = [];
      }
      revisionTimesData[row.dayOfWeek].push(row.block);
    }

    const blockTimesResult = await db
      .select()
      .from(blockTimes)
      .where(eq(blockTimes.userId, user.id));

    const blockTimesData = {};

    for (const row of blockTimesResult) {
      blockTimesData[row.blockName] = {
        startTime: row.startTime ? row.startTime.slice(0, 5) : '',
        endTime: row.endTime ? row.endTime.slice(0, 5) : '',
      };
    }

    // Get period-specific availability data
    const periodAvailabilityResult = await db
      .select()
      .from(periodSpecificAvailability)
      .where(eq(periodSpecificAvailability.userId, user.id));

    // Process period-specific availability data
    const processedPeriodAvailability = [];
    
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
      processedPeriodAvailability.push(periodsByDate[key]);
    }

    const data = {
      startDate: userPreferences.startDate,
      revisionTimes: revisionTimesData,
      blockTimes: blockTimesData,
      periodSpecificAvailability: processedPeriodAvailability,
    };

    res.status(200).json({ data: data });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}