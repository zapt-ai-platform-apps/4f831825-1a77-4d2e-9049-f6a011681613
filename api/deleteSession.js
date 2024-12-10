import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import getRawBody from "raw-body";
import { timetableEntries } from "../drizzle/schema.js";
import { eq, and } from "drizzle-orm";
import { db } from "../utils/dbClient.js";

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
    if (req.method !== 'DELETE') {
      res.setHeader('Allow', ['DELETE']);
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

    const { date, block } = body;

    if (!date || !block) {
      return res.status(400).json({ error: 'Date and block are required' });
    }

    const result = await db
      .delete(timetableEntries)
      .where(
        and(
          eq(timetableEntries.userId, user.id),
          eq(timetableEntries.date, date),
          eq(timetableEntries.block, block),
          eq(timetableEntries.isUserCreated, true)
        )
      );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.status(200).json({ message: 'Session deleted' });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error deleting session:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}