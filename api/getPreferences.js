import { authenticateUser } from './_apiUtils.js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { preferences, revisionTimes, blockTimes } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';
import * as Sentry from '@sentry/node';

// Helper function to safely format a date to YYYY-MM-DD
function formatDate(dateValue) {
  if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // If it's already in YYYY-MM-DD format, return as is
    return dateValue;
  }
  
  try {
    // Try to convert to a Date object and format it
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    Sentry.captureException(error, {
      extra: { dateValue, type: typeof dateValue }
    });
  }
  
  // Fallback to original value if conversion fails
  return String(dateValue);
}

export default async function handler(req, res) {
  try {
    // Authenticate user
    const user = await authenticateUser(req);
    
    // Connect to database
    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);
    
    console.log('[API] Getting preferences for user:', user.id);
    
    // Get user preferences
    const userPreferences = await db.select().from(preferences).where(eq(preferences.userId, user.id));
    
    // Get user's revision times
    const userRevisionTimes = await db.select().from(revisionTimes).where(eq(revisionTimes.userId, user.id));
    
    // Get user's block times
    const userBlockTimes = await db.select().from(blockTimes).where(eq(blockTimes.userId, user.id));
    
    // If no preferences found, return empty object
    if (userPreferences.length === 0) {
      console.log('[API] No preferences found for user:', user.id);
      return res.status(200).json({ data: null });
    }
    
    // Format revision times by day of week
    const formattedRevisionTimes = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };
    
    userRevisionTimes.forEach(time => {
      const day = time.dayOfWeek.toLowerCase();
      if (formattedRevisionTimes[day]) {
        formattedRevisionTimes[day].push(time.block);
      }
    });
    
    // Format block times
    const formattedBlockTimes = {};
    userBlockTimes.forEach(time => {
      formattedBlockTimes[time.blockName] = {
        startTime: time.startTime.substring(0, 5), // Format time as HH:MM
        endTime: time.endTime.substring(0, 5),
      };
    });
    
    console.log('[API] Retrieved startDate:', userPreferences[0].startDate);
    
    // Format response
    const response = {
      startDate: formatDate(userPreferences[0].startDate), // Use helper function to safely format the date
      revisionTimes: formattedRevisionTimes,
      blockTimes: formattedBlockTimes,
    };
    
    console.log('[API] Sending preferences response:', response);
    
    // Return formatted preferences
    return res.status(200).json({ data: response });
  } catch (error) {
    console.error('Error getting preferences:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Failed to get preferences' });
  }
}