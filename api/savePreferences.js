import { authenticateUser } from './_apiUtils.js';
import * as Sentry from '@sentry/node';
import { db } from './_dbClient.js';
import { preferences, revisionTimes, blockTimes, periodSpecificAvailability } from '../drizzle/schema.js';
import { eq, and } from 'drizzle-orm';

export default async function handler(req, res) {
  try {
    console.log('Saving preferences...');
    
    // Check if request method is POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed, expected POST' });
    }
    
    // Get user from auth token
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Parse request body
    const { data } = req.body;
    
    if (!data) {
      return res.status(400).json({ error: 'No data provided' });
    }
    
    // Validate required fields
    if (!data.startDate) {
      return res.status(400).json({ error: 'Start date is required' });
    }
    
    if (!data.revisionTimes) {
      return res.status(400).json({ error: 'Revision times are required' });
    }
    
    console.log(`Saving preferences for user: ${user.id}`);
    
    // Begin a transaction
    await db.transaction(async (tx) => {
      // Save or update preferences
      const existingPrefs = await tx.select()
        .from(preferences)
        .where(eq(preferences.userId, user.id));
      
      if (existingPrefs.length > 0) {
        await tx.update(preferences)
          .set({ startDate: data.startDate })
          .where(eq(preferences.userId, user.id));
      } else {
        await tx.insert(preferences)
          .values({
            userId: user.id,
            startDate: data.startDate,
          });
      }
      
      // Delete existing revision times
      await tx.delete(revisionTimes)
        .where(eq(revisionTimes.userId, user.id));
      
      // Insert new revision times
      const revisionTimesInserts = [];
      
      Object.entries(data.revisionTimes).forEach(([dayOfWeek, blocks]) => {
        blocks.forEach(block => {
          revisionTimesInserts.push({
            userId: user.id,
            dayOfWeek,
            block,
          });
        });
      });
      
      if (revisionTimesInserts.length > 0) {
        await tx.insert(revisionTimes).values(revisionTimesInserts);
      }
      
      // Save block times
      if (data.blockTimes) {
        // Delete existing block times
        await tx.delete(blockTimes)
          .where(eq(blockTimes.userId, user.id));
        
        // Insert new block times
        const blockTimesInserts = [];
        
        Object.entries(data.blockTimes).forEach(([blockName, times]) => {
          if (times && times.startTime && times.endTime) {
            blockTimesInserts.push({
              userId: user.id,
              blockName,
              startTime: times.startTime,
              endTime: times.endTime,
            });
          }
        });
        
        if (blockTimesInserts.length > 0) {
          await tx.insert(blockTimes).values(blockTimesInserts);
        }
      }
      
      // Save period-specific availability
      if (data.periodSpecificAvailability && Array.isArray(data.periodSpecificAvailability)) {
        // Delete existing period-specific availability for this user
        await tx.delete(periodSpecificAvailability)
          .where(eq(periodSpecificAvailability.userId, user.id));
        
        // Insert new period-specific availability records
        const periodAvailabilityInserts = [];
        
        data.periodSpecificAvailability.forEach(period => {
          if (period.startDate && period.endDate && period.revisionTimes) {
            Object.entries(period.revisionTimes).forEach(([dayOfWeek, blocks]) => {
              blocks.forEach(block => {
                periodAvailabilityInserts.push({
                  userId: user.id,
                  startDate: period.startDate,
                  endDate: period.endDate,
                  dayOfWeek,
                  block,
                  isAvailable: true
                });
              });
            });
          }
        });
        
        if (periodAvailabilityInserts.length > 0) {
          await tx.insert(periodSpecificAvailability).values(periodAvailabilityInserts);
        }
      }
    });
    
    console.log('Successfully saved preferences with period-specific availability');
    
    return res.status(200).json({ message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('Error saving preferences:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Failed to save preferences' });
  }
}