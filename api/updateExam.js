import { authenticateUser } from './_apiUtils.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { exams } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';
import * as Sentry from '@sentry/node';

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

/**
 * Handler for updating an exam
 */
export default async function handler(req, res) {
  console.log("updateExam API called");
  
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Authenticate user
    const user = await authenticateUser(req);
    
    // Parse request body
    const { data } = req.body;
    console.log("Update exam data received:", data);
    
    if (!data || !data.id) {
      return res.status(400).json({ error: 'Missing exam data or ID' });
    }
    
    // Initialize database connection
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);
    
    // Handle ID as either string or number 
    const examId = data.id;
    console.log(`Updating exam with ID: ${examId} (type: ${typeof examId})`);
    
    // Build update data object (exclude id field, which is used for the where clause)
    const { id, ...updateData } = data;
    
    // Update exam in database
    const result = await db.update(exams)
      .set({
        ...updateData,
        userId: user.id
      })
      .where(eq(exams.id, examId))
      .returning();
    
    console.log(`Exam updated. Result:`, result);
    
    // Close database connection
    await client.end();
    
    return res.status(200).json({ 
      message: 'Exam updated successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error updating exam:', error);
    Sentry.captureException(error);
    
    return res.status(500).json({ 
      error: `Error updating exam: ${error.message}` 
    });
  }
}