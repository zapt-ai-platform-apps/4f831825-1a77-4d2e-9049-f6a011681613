import { authenticateUser, Sentry } from "./_apiUtils.js";
import { api as timetableApi } from "@/modules/timetable/api.js";

export default async function handler(req, res) {
  try {
    // Authenticate user
    const user = await authenticateUser(req);
    const userId = user.id;
    
    console.log(`Generating timetable for user ${userId}`);
    
    // Delete existing timetable entries (preserving user-created ones)
    await timetableApi.deleteGeneratedTimetableEntries(userId);
    
    // Get user preferences and exams
    const preferences = await timetableApi.getUserPreferences(userId);
    const exams = await timetableApi.getUserExams(userId);
    const revisionTimesRows = await timetableApi.getUserRevisionTimes(userId);
    const blockTimes = await timetableApi.getUserBlockTimes(userId);
    
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
    
    // Generate the timetable
    const reviewedTimetable = await timetableApi.generateTimetable(
      userId,
      exams, 
      preferences.startDate, 
      revisionTimes,
      blockTimes
    );
    
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