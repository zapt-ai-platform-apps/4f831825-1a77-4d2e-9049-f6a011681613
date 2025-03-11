import { authenticateUser, Sentry } from "./_apiUtils.js";
import { db } from "./_dbClient.js";
import { timetableEntries } from "../drizzle/schema.js";
import { and, eq } from "drizzle-orm";

export default async function handler(req, res) {
  try {
    if (req.method !== "DELETE") {
      res.setHeader("Allow", ["DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Authenticate user
    const user = await authenticateUser(req);
    const userId = user.id;

    // Get entry details from request body
    const { date, block } = req.body;
    
    if (!date || !block) {
      return res.status(400).json({ error: "Date and block are required" });
    }

    console.log(`Deleting timetable entry for user ${userId} on ${date} (${block})`);

    // Delete the timetable entry
    const result = await db
      .delete(timetableEntries)
      .where(
        and(
          eq(timetableEntries.userId, userId),
          eq(timetableEntries.date, date),
          eq(timetableEntries.block, block)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Timetable entry not found" });
    }

    console.log("Successfully deleted timetable entry:", result[0]);
    return res.status(200).json({ message: "Timetable entry deleted successfully", entry: result[0] });
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    Sentry.captureException(error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}