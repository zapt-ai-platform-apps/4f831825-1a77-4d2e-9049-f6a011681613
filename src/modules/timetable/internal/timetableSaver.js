import { db } from "@/modules/core/api.js";
import { timetableEntries } from "../../../drizzle/schema.js";
import * as Sentry from "@sentry/node";

/**
 * Saves timetable entries to the database
 * @param {string} userId - User ID
 * @param {Array} timetable - Array of timetable entries
 * @returns {Promise<void>}
 */
export async function saveTimetable(userId, timetable) {
  try {
    if (!timetable || timetable.length === 0) {
      console.log("[INFO] No timetable entries to save.");
      return;
    }
    
    // Prepare entries for database insertion
    const entries = timetable.map(entry => ({
      userId: userId,
      date: entry.date,
      block: entry.block,
      subject: entry.subject,
      startTime: entry.startTime,
      endTime: entry.endTime,
      isUserCreated: entry.isUserCreated || false
    }));
    
    // Insert entries into database
    await db.insert(timetableEntries).values(entries);
    
    console.log(`[INFO] Saved ${entries.length} timetable entries for user ${userId}`);
  } catch (error) {
    console.error("[ERROR] Failed to save timetable:", error);
    Sentry.captureException(error);
    throw error;
  }
}