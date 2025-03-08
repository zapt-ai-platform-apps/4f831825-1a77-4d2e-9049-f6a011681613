import * as Sentry from "@sentry/node";

/**
 * @deprecated This utility function is not used in production.
 * Actual timetable saving is implemented in the API endpoint.
 * This file is maintained for testing and reference purposes.
 * 
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
    
    // Validate input parameters
    if (!userId) {
      throw new Error("User ID is required to save timetable");
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
    
    console.log(`[INFO] Mock: Saving ${entries.length} timetable entries for user ${userId}`);
    
    // This function doesn't actually perform database operations
    // For actual implementation, see /api/saveTimetable.js
    
    console.log(`[INFO] Mock: Saved ${entries.length} timetable entries for user ${userId}`);
  } catch (error) {
    console.error("[ERROR] Failed to save timetable:", error);
    Sentry.captureException(error);
    throw error;
  }
}