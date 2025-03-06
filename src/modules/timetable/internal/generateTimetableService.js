import * as Sentry from "@sentry/node";
import { authenticateUser } from "../../auth/internal/authUtils.js";
import { deleteGeneratedTimetableEntries } from "./dataAccess.js";
import { generateTimetable } from "./timetableGenerator.js";
import { reviewTimetable } from "./timetableReviewer.js";
import { saveTimetable } from "./timetableSaver.js";
import { 
  getUserPreferences, 
  getUserExams, 
  getUserRevisionTimes, 
  getUserBlockTimes
} from "./dataAccess.js";
import { db } from "../../../utils/dbClient.js";

/**
 * Main handler for timetable generation
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {Object} Sentry - Sentry error tracking instance
 */
export async function generateTimetableHandler(req, res, Sentry) {
  try {
    // Authenticate user
    const user = await authenticateUser(req);
    const userId = user.id;

    // Delete existing generated timetable entries (keeping user-created ones)
    await deleteGeneratedTimetableEntries(db, userId);

    // Fetch user data
    const preferences = await getUserPreferences(db, userId);
    const exams = await getUserExams(db, userId);
    const revisionTimes = await getUserRevisionTimes(db, userId);
    const blockTimes = await getUserBlockTimes(db, userId);

    if (!preferences) {
      return res.status(400).json({ 
        error: "You need to set preferences before generating a timetable" 
      });
    }

    if (!exams.length) {
      return res.status(400).json({ 
        error: "You need to add at least one exam before generating a timetable" 
      });
    }

    // Process revision times
    const revisionTimesData = processRevisionTimes(revisionTimes);

    // Generate timetable
    const timetable = await generateTimetable(
      exams,
      preferences.startDate,
      revisionTimesData,
      blockTimes
    );

    // Review timetable with ChatGPT (optional enhancement)
    const finalTimetable = await reviewTimetable(userId, timetable);

    // Save timetable
    await saveTimetable(userId, finalTimetable);

    res.status(200).json({ message: "Timetable generated successfully" });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error generating timetable:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

/**
 * Process revision times from database format to a more usable structure
 * @param {Array} revisionTimes - Revision times from database
 * @returns {Object} Processed revision times by day of week
 */
function processRevisionTimes(revisionTimes) {
  const processed = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  for (const row of revisionTimes) {
    processed[row.dayOfWeek].push(row.block);
  }

  return processed;
}