import { authenticateUser } from "../api/_apiUtils.js";
import { db } from "../utils/dbClient.js";
import {
  deleteGeneratedTimetableEntries,
  getUserPreferences,
  getUserExams,
  getUserRevisionTimes,
  getUserBlockTimes,
  insertTimetableEntries,
} from "../utils/dataAccess.js";
import { callChatGPTForTimetable } from "../utils/callChatGPTForTimetable.js";

export async function generateTimetableHandler(req, res, Sentry) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    // Delete existing generated timetable entries (exclude user-created entries)
    await deleteGeneratedTimetableEntries(db, user.id);

    // Fetch user's exams, preferences, revision times, and block times
    const userPreferences = await getUserPreferences(db, user.id);
    const userExams = await getUserExams(db, user.id);
    const revisionTimesResult = await getUserRevisionTimes(db, user.id);
    const blockTimesData = await getUserBlockTimes(db, user.id);

    if (!userPreferences) {
      return res.status(400).json({ error: "User preferences not found" });
    }

    if (!userExams.length) {
      return res.status(400).json({ error: "No exams found for user" });
    }

    if (!revisionTimesResult.length) {
      return res.status(400).json({ error: "No revision times found for user" });
    }

    // -----------------------------------------------------------------------------------
    // NEW: Call ChatGPT for timetable generation
    // -----------------------------------------------------------------------------------
    const timetableData = await callChatGPTForTimetable({
      userId: user.id,
      userPreferences,
      userExams,
      revisionTimesResult,
      blockTimesData,
    });

    // Save timetable entries
    if (timetableData && timetableData.length > 0) {
      await insertTimetableEntries(db, timetableData);
    }

    res.status(200).json({ message: "Timetable generated via ChatGPT" });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error generating timetable:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}