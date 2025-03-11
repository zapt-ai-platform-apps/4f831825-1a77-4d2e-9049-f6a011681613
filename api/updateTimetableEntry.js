import { authenticateUser, Sentry } from "./_apiUtils.js";
import { db } from "./_dbClient.js";
import { timetableEntries } from "../drizzle/schema.js";
import { and, eq } from "drizzle-orm";

export default async function handler(req, res) {
  try {
    if (req.method !== "PUT") {
      res.setHeader("Allow", ["PUT"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Authenticate user
    const user = await authenticateUser(req);
    const userId = user.id;

    // Get entry details from request body
    const { date, block, subject, startTime, endTime, isComplete, isUserCreated } = req.body;
    
    if (!date || !block) {
      return res.status(400).json({ error: "Date and block are required" });
    }

    console.log(`Updating timetable entry for user ${userId} on ${date} (${block})`);

    // Prepare update data - only include fields that are provided
    const updateData = {};
    if (subject !== undefined) updateData.subject = subject;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (isComplete !== undefined) updateData.isComplete = isComplete;
    if (isUserCreated !== undefined) updateData.isUserCreated = isUserCreated;

    // Update the timetable entry
    const result = await db
      .update(timetableEntries)
      .set(updateData)
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

    console.log("Successfully updated timetable entry:", result[0]);
    return res.status(200).json({ message: "Timetable entry updated successfully", entry: result[0] });
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    Sentry.captureException(error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}