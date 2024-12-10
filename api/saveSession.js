import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import getRawBody from "raw-body";
import { timetableEntries } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";
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
      return res.status(400).json({ error: 'Session data is required' });
    }

    const { date, block, subject, startTime, endTime } = data;

    if (!date || !block || !subject || !startTime || !endTime) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    await db
      .insert(timetableEntries)
      .values({
        userId: user.id,
        date: date,
        block: block,
        subject: subject,
        startTime: startTime,
        endTime: endTime,
        isUserCreated: true,
      });

    res.status(200).json({ message: 'Session saved' });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error saving session:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}