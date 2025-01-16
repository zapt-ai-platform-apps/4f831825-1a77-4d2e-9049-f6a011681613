import { authenticateUser } from "../api/_apiUtils.js";
import { db } from "../utils/dbClient.js";
import { processTimetableGeneration } from "./timetableProcessor.js";
import * as Sentry from "@sentry/node";

/**
 * generateTimetableHandler
 * 1) Deletes non-user-created timetable entries
 * 2) Builds an array of blank sessions (date/block/subject="")
 * 3) Generates a full timetable locally using generateTimetableLocally
 * 4) Sends that locally generated timetable to ChatGPT for review/adjustments
 * 5) Saves the final schedule to the database
 */
export async function generateTimetableHandler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    // Process timetable generation
    await processTimetableGeneration(db, user.id);

    res.status(200).json({ message: "Timetable generated and reviewed successfully" });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error generating timetable:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}