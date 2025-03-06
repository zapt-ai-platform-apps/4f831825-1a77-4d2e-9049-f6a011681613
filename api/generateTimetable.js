import { authenticateUser, Sentry } from "./_apiUtils.js";
import { db } from "./_dbClient.js";
import { timetableEntries, exams, preferences, revisionTimes, blockTimes } from "../drizzle/schema.js";
import { eq, and } from "drizzle-orm";

export default async function handler(req, res) {
  try {
    // Authenticate user
    const user = await authenticateUser(req);
    const userId = user.id;
    
    console.log(`Generating timetable for user ${userId}`);
    
    // Delete existing timetable entries (preserving user-created ones)
    await db
      .delete(timetableEntries)
      .where(
        and(
          eq(timetableEntries.userId, userId),
          eq(timetableEntries.isUserCreated, false)
        )
      );
    
    // Get user preferences
    const preferencesResult = await db
      .select()
      .from(preferences)
      .where(eq(preferences.userId, userId))
      .limit(1);
    
    if (!preferencesResult.length) {
      return res.status(400).json({ 
        error: "No preferences found. Please set your revision preferences first." 
      });
    }
    
    const userPreferences = preferencesResult[0];
    
    // Get user exams
    const userExams = await db
      .select()
      .from(exams)
      .where(eq(exams.userId, userId));
    
    if (userExams.length === 0) {
      return res.status(400).json({ 
        error: "No exams found. Please add exams first." 
      });
    }
    
    // Get user revision times
    const revisionTimesRows = await db
      .select()
      .from(revisionTimes)
      .where(eq(revisionTimes.userId, userId));
    
    // Check if there are any revision times
    if (revisionTimesRows.length === 0) {
      return res.status(400).json({
        error: "No revision times found. Please set your available revision times in preferences."
      });
    }
    
    // Get user block times
    const blockTimesRows = await db
      .select()
      .from(blockTimes)
      .where(eq(blockTimes.userId, userId));
    
    // Process revision times into format needed by the generator
    const processedRevisionTimes = revisionTimesRows.reduce((acc, row) => {
      const day = row.dayOfWeek;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(row.block);
      return acc;
    }, {});
    
    // Process block times
    const processedBlockTimes = {};
    blockTimesRows.forEach(row => {
      processedBlockTimes[row.blockName] = {
        startTime: row.startTime,
        endTime: row.endTime
      };
    });
    
    // Import the timetable generator logic
    const { generateTimetable: generateTimetableInternal } = await import("../src/modules/timetable/internal/timetableGenerator.js");
    
    // Generate the timetable
    const timetable = await generateTimetableInternal(
      userExams,
      userPreferences.startDate,
      processedRevisionTimes,
      processedBlockTimes
    );
    
    // Import the timetable review logic if needed
    // const { reviewTimetable } = await import("../src/modules/timetable/internal/timetableReviewer.js");
    // const reviewedTimetable = await reviewTimetable(userId, timetable);
    
    // Prepare the timetable entries for database
    const timetableEntriesToInsert = timetable.map(entry => ({
      userId: userId,
      date: entry.date,
      block: entry.block,
      subject: entry.subject,
      startTime: entry.startTime,
      endTime: entry.endTime,
      isUserCreated: false
    }));
    
    // Save the timetable entries
    if (timetableEntriesToInsert.length > 0) {
      await db.insert(timetableEntries).values(timetableEntriesToInsert);
    } else {
      return res.status(400).json({
        error: "Could not generate a viable timetable. Please check your exams and revision preferences."
      });
    }
    
    return res.status(200).json({
      message: "Timetable generated successfully",
      count: timetableEntriesToInsert.length
    });
  } catch (error) {
    console.error("Error generating timetable:", error);
    Sentry.captureException(error);
    return res.status(500).json({ error: error.message || "Error generating timetable" });
  }
}