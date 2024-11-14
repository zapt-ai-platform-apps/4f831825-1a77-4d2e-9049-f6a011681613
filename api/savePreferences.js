import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { preferences } from '../drizzle/schema.js';

Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
  initialScope: {
    tags: {
      type: 'backend',
      projectId: process.env.PROJECT_ID
    }
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const user = await authenticateUser(req);

    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: 'Preferences data is required' });
    }

    const sql = neon(process.env.NEON_DB_URL);
    const db = drizzle(sql);

    await db.insert(preferences)
      .values({
        userId: user.id,
        data: data,
      })
      .onConflictDoUpdate({
        target: preferences.userId,
        set: { data: data },
      });

    res.status(200).json({ message: 'Preferences saved' });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error saving preferences:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}