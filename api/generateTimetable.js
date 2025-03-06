import { authenticateUser, Sentry } from "./_apiUtils.js";
import { db } from "../src/modules/core/internal/dbClient.js";
import { deleteGeneratedTimetableEntries } from "../src/modules/timetable/internal/dataAccess.js";
import { getUserPreferences, getUserExams, getUserRevisionTimes, getUserBlockTimes } from "../src/modules/timetable/internal/dataAccess.js";
import { generateTimetable } from "../src/modules/timetable/internal/timetableGenerator.js";
import { reviewTimetable } from "../src/modules/timetable/internal/timetableReviewer.js";
import { saveTimetable } from "../src/modules/timetable/internal/timetableSaver.js";

export default async function handler(req, res) {
  try {
    // Authenticate user
    const user = await authenticateUser(req);
    const userId = user.id;
    
    console.log(`Generating timetable for user ${userId}`);
    
    // Get user preferences and exams
    const preferences = await getUserPreferences(db, userId);
    const exams = await getUserExams(db, userId);
    const revisionTimesRows = await getUserRevisionTimes(db, userId);
    const blockTimes = await getUserBlockTimes(db, userId);
    
    // Process revision times into format needed by the generator
    const revisionTimes = revisionTimesRows.reduce((acc, row) => {
      const day = row.dayOfWeek;
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(row.block);
      return acc;
    }, {});
    
    if (!preferences?.startDate) {
      return res.status(400).json({ 
        error: "No preferences found. Please set your revision preferences first." 
      });
    }
    
    if (exams.length === 0) {
      return res.status(400).json({ 
        error: "No exams found. Please add exams first." 
      });
    }
    
    // Delete existing timetable entries (preserving user-created ones)
    await deleteGeneratedTimetableEntries(db, userId);
    
    // Generate the timetable
    const generatedTimetable = await generateTimetable(
      exams, 
      preferences.startDate, 
      revisionTimes,
      blockTimes
    );
    
    // Get AI review of timetable (optional enhancement)
    const reviewedTimetable = await reviewTimetable(userId, generatedTimetable);
    
    // Save the timetable to the database
    await saveTimetable(userId, reviewedTimetable);
    
    return res.status(200).json({
      message: "Timetable generated successfully",
      count: reviewedTimetable.length
    });
  } catch (error) {
    console.error("Error generating timetable:", error);
    Sentry.captureException(error);
    return res.status(500).json({ error: "Error generating timetable" });
  }
}