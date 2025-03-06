import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import { db } from "./dbClient.js";
import { preferences, revisionTimes, blockTimes } from "../drizzle/schema.js";
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

    const data = {
      startDate: userPreferences.startDate,
      revisionTimes: revisionTimesData,
      blockTimes: blockTimesData,
    };

    res.status(200).json({ data: data });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching preferences:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}