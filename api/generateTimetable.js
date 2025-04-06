import { authenticateUser } from './_apiUtils.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { timetableEntries } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';
import * as Sentry from '@sentry/node';
import { parseISO, isValid, isBefore } from 'date-fns';
import { generateTimetable as generateTimetableCore } from '../src/modules/timetable/internal/timetableGeneratorCore.js';

// Initialize Sentry
Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
  initialScope: {
    tags: {
      type: 'backend',
      projectId: process.env.VITE_PUBLIC_APP_ID
    }
  }
});

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Authenticate user
    const user = await authenticateUser(req);

    // Get request data
    const { exams, startDate, revisionTimes, blockTimes } = JSON.parse(req.body);

    console.log(`Generating timetable for user ${user.id} with ${exams.length} exams`);

    // Validate start date
    const parsedStartDate = parseISO(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of today
    
    if (!isValid(parsedStartDate)) {
      console.error('Invalid start date format:', startDate);
      return res.status(400).json({ error: 'Invalid start date format' });
    }
    
    if (isBefore(parsedStartDate, today)) {
      console.error('Start date is in the past:', startDate);
      return res.status(400).json({ error: 'Start date cannot be in the past' });
    }

    // Generate timetable
    const generatedEntries = await generateTimetableCore(exams, startDate, revisionTimes, blockTimes);

    // Initialize database client
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    // Delete existing entries
    await db.delete(timetableEntries)
      .where(eq(timetableEntries.userId, user.id))
      .where(eq(timetableEntries.isUserCreated, false));

    console.log(`Deleted existing timetable entries for user ${user.id}`);

    // Prepare entries for saving to database
    const entriesToSave = generatedEntries.map(entry => ({
      userId: user.id,
      date: entry.date,
      block: entry.block,
      subject: entry.subject,
      startTime: entry.startTime,
      endTime: entry.endTime,
      isUserCreated: false,
      isComplete: false
    }));

    // Save new entries in batches to avoid exceeding statement limits
    const batchSize = 100;
    for (let i = 0; i < entriesToSave.length; i += batchSize) {
      const batch = entriesToSave.slice(i, i + batchSize);
      if (batch.length > 0) {
        await db.insert(timetableEntries).values(batch);
      }
    }

    console.log(`Saved ${entriesToSave.length} new timetable entries for user ${user.id}`);

    // Close database connection
    await client.end();

    return res.status(200).json({
      message: 'Timetable generated successfully',
      entriesCount: generatedEntries.length
    });
  } catch (error) {
    console.error('Error generating timetable:', error);
    Sentry.captureException(error);
    
    return res.status(500).json({
      error: 'Failed to generate timetable',
      message: error.message
    });
  }
}