import { authenticateUser, Sentry } from "./_apiUtils.js";
import { db } from "./_dbClient.js";
import { timetableEntries } from "../drizzle/schema.js";
import { and, eq } from "drizzle-orm";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Authenticate user
    const user = await authenticateUser(req);
    const userId = user.id;

    // Get entries to swap from request body
    const { entry1, entry2 } = req.body;
    
    if (!entry1 || !entry2 ||
        !entry1.date || !entry1.block || !entry1.subject ||
        !entry2.date || !entry2.block || !entry2.subject) {
      return res.status(400).json({ error: "Both entries with date, block, and subject are required" });
    }

    console.log(`Swapping timetable entries for user ${userId}`);
    console.log(`Entry 1: ${entry1.date} ${entry1.block} - ${entry1.subject}`);
    console.log(`Entry 2: ${entry2.date} ${entry2.block} - ${entry2.subject}`);

    // Start a transaction to ensure both updates succeed or fail together
    const result = await db.transaction(async (tx) => {
      // First fetch both entries to ensure they exist
      const firstEntry = await tx
        .select()
        .from(timetableEntries)
        .where(
          and(
            eq(timetableEntries.userId, userId),
            eq(timetableEntries.date, entry1.date),
            eq(timetableEntries.block, entry1.block)
          )
        )
        .then(res => res[0]);
        
      const secondEntry = await tx
        .select()
        .from(timetableEntries)
        .where(
          and(
            eq(timetableEntries.userId, userId),
            eq(timetableEntries.date, entry2.date),
            eq(timetableEntries.block, entry2.block)
          )
        )
        .then(res => res[0]);
        
      if (!firstEntry || !secondEntry) {
        throw new Error("One or both entries not found");
      }
        
      // Update first entry with second entry's subject
      const updatedFirst = await tx
        .update(timetableEntries)
        .set({
          subject: entry2.subject,
          isUserCreated: true // Mark as user-created since it's manually swapped
        })
        .where(
          and(
            eq(timetableEntries.userId, userId),
            eq(timetableEntries.date, entry1.date),
            eq(timetableEntries.block, entry1.block)
          )
        )
        .returning();
            
      // Update second entry with first entry's subject
      const updatedSecond = await tx
        .update(timetableEntries)
        .set({
          subject: entry1.subject,
          isUserCreated: true // Mark as user-created since it's manually swapped
        })
        .where(
          and(
            eq(timetableEntries.userId, userId),
            eq(timetableEntries.date, entry2.date),
            eq(timetableEntries.block, entry2.block)
          )
        )
        .returning();
            
      return {
        entry1: updatedFirst[0],
        entry2: updatedSecond[0]
      };
    });

    console.log("Successfully swapped timetable entries");
    return res.status(200).json({
      message: "Timetable entries swapped successfully",
      entries: result
    });
  } catch (error) {
    console.error("Error swapping timetable entries:", error);
    Sentry.captureException(error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}