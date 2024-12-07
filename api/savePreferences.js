import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { preferences, revisionTimes, timetableEntries } from "../drizzle/schema.js";
import getRawBody from "raw-body";
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
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    const bodyBuffer = await getRawBody(req);
    const bodyString = bodyBuffer.toString('utf-8');
    let body;
    try {
      body = JSON.parse(bodyString);
    } catch (e) {
      throw new Error('Invalid JSON');
    }

    const { data } = body;

    if (!data) {
      return res.status(400).json({ error: 'Preferences data is required' });
    }

    if (!data.startDate) {
      return res.status(400).json({ error: 'Start date is required' });
    }

    const hasAtLeastOneBlockSelected = Object.values(data.revisionTimes || {}).some(
      (blocks) => blocks && blocks.length > 0
    );

    if (!hasAtLeastOneBlockSelected) {
      return res.status(400).json({ error: 'At least one revision time must be selected.' });
    }

    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // Delete existing preferences, revision times, and timetable entries
    await db.delete(preferences).where(eq(preferences.userId, user.id));
    await db.delete(revisionTimes).where(eq(revisionTimes.userId, user.id));
    await db.delete(timetableEntries).where(eq(timetableEntries.userId, user.id));

    // Insert new preferences
    await db.insert(preferences).values({
      userId: user.id,
      startDate: data.startDate,
    });

    // Insert new revision times
    const revisionTimesData = [];
    for (const [day, blocks] of Object.entries(data.revisionTimes)) {
      for (const block of blocks) {
        revisionTimesData.push({
          userId: user.id,
          dayOfWeek: day,
          block: block,
        });
      }
    }
    if (revisionTimesData.length > 0) {
      await db.insert(revisionTimes).values(revisionTimesData);
    }

    res.status(200).json({ message: 'Preferences saved and old timetable removed' });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error saving preferences:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}