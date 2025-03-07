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
 * Handler for deleting an exam
 */
export default async function handler(req, res) {
  console.log("deleteExam API called");
  
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Authenticate user
    const user = await authenticateUser(req);
    
    // Parse request body
    const { id } = req.body;
    console.log("Delete exam ID received:", id, `(type: ${typeof id})`);
    
    if (!id) {
      return res.status(400).json({ error: 'Missing exam ID' });
    }
    
    // Initialize database connection
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);
    
    // Delete exam from database - using the ID as is, whether string or number
    const result = await db.delete(exams)
      .where(eq(exams.id, id))
      .returning();
    
    console.log(`Exam deleted. Result:`, result);
    
    // Close database connection
    await client.end();
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }
    
    return res.status(200).json({ 
      message: 'Exam deleted successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Error deleting exam:', error);
    Sentry.captureException(error);
    
    return res.status(500).json({ 
      error: `Error deleting exam: ${error.message}` 
    });
  }
}