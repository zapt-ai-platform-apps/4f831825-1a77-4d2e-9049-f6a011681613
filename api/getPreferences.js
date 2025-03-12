import { authenticateUser } from './_apiUtils.js';
import * as Sentry from '@sentry/node';
import { db } from './_dbClient.js';
import { preferences, revisionTimes, blockTimes, periodSpecificAvailability } from '../drizzle/schema.js';
import { eq, and } from 'drizzle-orm';

export default async function handler(req, res) {
  try {
    console.log('Getting preferences...');
    
    // Check if request method is GET
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed, expected GET' });
    }
    
    // Get user from auth token
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    console.log(`Getting preferences for user: ${user.id}`);
    
    // Get user preferences from database
    const userPreferences = await db.select().from(preferences).where(eq(preferences.userId, user.id));
    
    if (userPreferences.length === 0) {
      console.log('No preferences found for user');
      return res.status(200).json({ data: null });
    }
    
    // Get revision times
    const userRevisionTimes = await db.select().from(revisionTimes).where(eq(revisionTimes.userId, user.id));
    
    // Get block times
    const userBlockTimes = await db.select().from(blockTimes).where(eq(blockTimes.userId, user.id));
    
    // Get period-specific availability
    const userPeriodSpecificAvailability = await db.select().from(periodSpecificAvailability)
      .where(eq(periodSpecificAvailability.userId, user.id));
    
    // Format revision times
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
      formattedRevisionTimes[time.dayOfWeek].push(time.block);
    });
    
    // Format block times
    const formattedBlockTimes = {};
    userBlockTimes.forEach(block => {
      formattedBlockTimes[block.blockName] = {
        startTime: block.startTime,
        endTime: block.endTime,
      };
    });
    
    // Group period-specific availability by date ranges
    const periodRangeMap = new Map();
    
    userPeriodSpecificAvailability.forEach(periodItem => {
      const key = `${periodItem.startDate}-${periodItem.endDate}`;
      
      if (!periodRangeMap.has(key)) {
        periodRangeMap.set(key, {
          startDate: periodItem.startDate,
          endDate: periodItem.endDate,
          revisionTimes: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: [],
          }
        });
      }
      
      if (periodItem.isAvailable) {
        periodRangeMap.get(key).revisionTimes[periodItem.dayOfWeek].push(periodItem.block);
      }
    });
    
    // Format the complete preferences object
    const formattedPreferences = {
      startDate: userPreferences[0].startDate,
      revisionTimes: formattedRevisionTimes,
      blockTimes: formattedBlockTimes,
      periodSpecificAvailability: Array.from(periodRangeMap.values())
    };
    
    console.log('Successfully retrieved preferences with period-specific availability');
    
    return res.status(200).json({ data: formattedPreferences });
  } catch (error) {
    console.error('Error getting preferences:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Failed to get preferences' });
  }
}