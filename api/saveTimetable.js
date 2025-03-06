import { authenticateUser, Sentry } from "./_apiUtils.js";
import { db } from "./_dbClient.js";
import { timetableEntries } from "../drizzle/schema.js";
import { eq, and } from "drizzle-orm";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Authenticate user
    const user = await authenticateUser(req);
    const userId = user.id;

    // Get timetable data from request body
    const { data: timetableData } = req.body;

    if (!timetableData || !Array.isArray(timetableData) || timetableData.length === 0) {
      return res.status(400).json({ error: "Valid timetable data is required" });
    }

    console.log(`Saving timetable with ${timetableData.length} entries for user ${userId}`);

    // Delete existing system-generated entries (preserve user-created ones)
    await db
      .delete(timetableEntries)
      .where(
        and(
          eq(timetableEntries.userId, userId),
          eq(timetableEntries.isUserCreated, false)
        )
      );

    // Prepare entries for database insertion
    const entriesToInsert = timetableData.map(entry => ({
      userId: userId,
      date: entry.date,
      block: entry.block,
      subject: entry.subject,
      startTime: entry.startTime,
      endTime: entry.endTime,
      isUserCreated: entry.isUserCreated || false
    }));

    // Insert new entries
    await db.insert(timetableEntries).values(entriesToInsert);

    return res.status(200).json({ message: "Timetable saved successfully", count: entriesToInsert.length });
  } catch (error) {
    console.error("Error saving timetable:", error);
    Sentry.captureException(error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}