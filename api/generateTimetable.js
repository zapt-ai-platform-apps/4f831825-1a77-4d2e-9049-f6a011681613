import { authenticateUser } from './_apiUtils.js';
import * as Sentry from '@sentry/node';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { timetableEntries } from '../drizzle/schema.js';
import { captureTimetableError } from '../src/modules/timetable/internal/errorUtils.js';

// Importing the timetable generator directly for server-side execution
import { generateTimetableCore } from '../src/modules/timetable/internal/timetableGeneratorCore.js';

export default async function handler(req, res) {
  // Initialize context object for error tracking
  const context = {
    location: 'api/generateTimetable.js',
    additionalData: {
      requestMethod: req.method,
      requestHeaders: req.headers
    }
  };
  
  try {
    // Authenticate the user
    const user = await authenticateUser(req);
    context.additionalData.userId = user.id;
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Parse request body
    const { exams, startDate, revisionTimes, blockTimes } = req.body;
    
    // Add input data to context
    context.exams = exams;
    context.startDate = startDate;
    context.revisionTimes = revisionTimes;
    context.blockTimes = blockTimes;
    
    // Basic validation
    if (!exams || !Array.isArray(exams) || exams.length === 0) {
      return res.status(400).json({ error: 'No exams provided' });
    }
    
    if (!startDate) {
      return res.status(400).json({ error: 'No start date provided' });
    }
    
    if (!revisionTimes || typeof revisionTimes !== 'object') {
      return res.status(400).json({ error: 'Invalid revision times format' });
    }
    
    console.log('Generating timetable for user:', user.id);
    console.log('Number of exams:', exams.length);
    console.log('Start date:', startDate);
    
    // Generate the timetable
    const generatedTimetable = await generateTimetableCore(
      exams,
      startDate,
      revisionTimes,
      blockTimes
    );
    
    // Log success information
    console.log('Successfully generated timetable with', generatedTimetable.length, 'entries');
    
    // Connect to database
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);
    
    // Save generated timetable entries
    for (const entry of generatedTimetable) {
      await db.insert(timetableEntries).values({
        userId: user.id,
        date: entry.date,
        block: entry.block,
        subject: entry.subject,
        startTime: entry.startTime,
        endTime: entry.endTime,
        isUserCreated: false
      });
    }
    
    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Timetable generated successfully',
      entries: generatedTimetable.length
    });
    
  } catch (error) {
    console.error('Error generating timetable:', error);
    
    // Enhanced error handling with context
    captureTimetableError(error, context);
    
    return res.status(500).json({ 
      error: 'Failed to generate timetable', 
      message: error.message 
    });
  }
}