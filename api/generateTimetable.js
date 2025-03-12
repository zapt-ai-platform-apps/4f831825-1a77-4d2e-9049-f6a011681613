import { authenticateUser } from './_apiUtils.js';
import * as Sentry from '@sentry/node';
import { db } from './_dbClient.js';
import { exams, preferences, revisionTimes, blockTimes, periodSpecificAvailability, timetableEntries } from '../drizzle/schema.js';
import { eq, gte } from 'drizzle-orm';

// Import core generator functions
import { generateTimetable as generateTimetableCore } from '../src/modules/timetable/internal/timetableGeneratorCore.js';
import { format, parseISO } from 'date-fns';

export default async function handler(req, res) {
  try {
    console.log('Generating timetable...');
    
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed, expected POST' });
    }
    
    // Get user from auth token
    const user = await authenticateUser(req);
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    console.log(`Generating timetable for user: ${user.id}`);
    
    // Get user exams
    const userExams = await db.select()
      .from(exams)
      .where(eq(exams.userId, user.id))
      .orderBy(exams.examDate);
    
    if (userExams.length === 0) {
      return res.status(400).json({ error: 'No exams found. Please add exams first.' });
    }
    
    // Get user preferences
    const userPreferences = await db.select()
      .from(preferences)
      .where(eq(preferences.userId, user.id));
    
    if (userPreferences.length === 0) {
      return res.status(400).json({ error: 'No preferences found. Please set your revision preferences first.' });
    }
    
    // Get revision times
    const userRevisionTimes = await db.select()
      .from(revisionTimes)
      .where(eq(revisionTimes.userId, user.id));
    
    // Get block times
    const userBlockTimes = await db.select()
      .from(blockTimes)
      .where(eq(blockTimes.userId, user.id));
      
    // Get period-specific availability
    const userPeriodSpecificAvailability = await db.select()
      .from(periodSpecificAvailability)
      .where(eq(periodSpecificAvailability.userId, user.id));
    
    // Format data for timetable generation
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
    
    const formattedBlockTimes = {};
    userBlockTimes.forEach(block => {
      formattedBlockTimes[block.blockName] = {
        startTime: block.startTime,
        endTime: block.endTime,
      };
    });
    
    // Format period-specific availability
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
    
    // Add period-specific availability to revision times data
    formattedRevisionTimes.periodSpecificAvailability = Array.from(periodRangeMap.values());
    
    // Generate timetable
    const timetableData = await generateTimetableCore(
      userExams,
      userPreferences[0].startDate,
      formattedRevisionTimes,
      formattedBlockTimes
    );
    
    if (!timetableData || timetableData.length === 0) {
      return res.status(400).json({ error: 'Could not generate a viable timetable. Please check your exams and revision preferences.' });
    }
    
    console.log(`Generated ${timetableData.length} timetable entries`);
    
    // Clear existing timetable entries for this user
    await db.delete(timetableEntries)
      .where(eq(timetableEntries.userId, user.id));
    
    // Insert new timetable entries
    const timetableInserts = timetableData.map(entry => ({
      userId: user.id,
      date: entry.date,
      block: entry.block,
      subject: entry.subject,
      startTime: entry.startTime,
      endTime: entry.endTime,
      isUserCreated: false,
      isComplete: false
    }));
    
    await db.insert(timetableEntries).values(timetableInserts);
    
    console.log('Successfully generated and saved timetable');
    
    return res.status(200).json({ 
      message: 'Timetable generated successfully',
      count: timetableData.length
    });
  } catch (error) {
    console.error('Error generating timetable:', error);
    Sentry.captureException(error);
    return res.status(500).json({ error: 'Failed to generate timetable: ' + error.message });
  }
}