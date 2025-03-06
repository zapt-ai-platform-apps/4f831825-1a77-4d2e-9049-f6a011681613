import {
  preferences,
  exams,
  revisionTimes,
  timetableEntries,
  blockTimes,
} from "../../../drizzle/schema.js";
import { eq, and } from "drizzle-orm";
import { db } from "../../../api/dbClient.js";

/**
 * Deletes all timetable entries for a user
 * @param {Object} db - Database client
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function deleteUserTimetableEntries(db, userId) {
  await db.delete(timetableEntries).where(eq(timetableEntries.userId, userId));
}

/**
 * Deletes only system-generated timetable entries for a user (keeping user-created entries)
 * @param {Object} db - Database client
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export async function deleteGeneratedTimetableEntries(db, userId) {
  await db
    .delete(timetableEntries)
    .where(
      and(
        eq(timetableEntries.userId, userId),
        eq(timetableEntries.isUserCreated, false)
      )
    );
}

/**
 * Gets user preferences
 * @param {Object} db - Database client
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User preferences or null
 */
export async function getUserPreferences(db, userId) {
  const prefsResult = await db
    .select()
    .from(preferences)
    .where(eq(preferences.userId, userId))
    .limit(1);

  if (!prefsResult.length) {
    return null;
  }

  const userPreferences = prefsResult[0];
  userPreferences.userId = userId;
  return userPreferences;
}

/**
 * Gets user exams
 * @param {Object} db - Database client
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User exams
 */
export async function getUserExams(db, userId) {
  return await db
    .select()
    .from(exams)
    .where(eq(exams.userId, userId));
}

/**
 * Gets user revision times
 * @param {Object} db - Database client
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User revision times
 */
export async function getUserRevisionTimes(db, userId) {
  return await db
    .select()
    .from(revisionTimes)
    .where(eq(revisionTimes.userId, userId));
}

/**
 * Gets user block times
 * @param {Object} db - Database client
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User block times
 */
export async function getUserBlockTimes(db, userId) {
  const blockTimesResult = await db
    .select()
    .from(blockTimes)
    .where(eq(blockTimes.userId, userId));
  
  const blockTimesData = {};
  for (const row of blockTimesResult) {
    blockTimesData[row.blockName] = {
      startTime: row.startTime,
      endTime: row.endTime,
    };
  }
  return blockTimesData;
}

/**
 * Insert timetable entries
 * @param {Object} db - Database client
 * @param {Array} timetableData - Timetable entries
 * @returns {Promise<void>}
 */
export async function insertTimetableEntries(db, timetableData) {
  await db.insert(timetableEntries).values(timetableData);
}