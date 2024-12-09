import {
  preferences,
  exams,
  revisionTimes,
  timetableEntries,
  blockTimes,
} from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

export async function deleteUserTimetableEntries(db, userId) {
  await db.delete(timetableEntries).where(eq(timetableEntries.userId, userId));
}

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

export async function getUserExams(db, userId) {
  return await db
    .select()
    .from(exams)
    .where(eq(exams.userId, userId));
}

export async function getUserRevisionTimes(db, userId) {
  return await db
    .select()
    .from(revisionTimes)
    .where(eq(revisionTimes.userId, userId));
}

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

export async function insertTimetableEntries(db, timetableData) {
  await db.insert(timetableEntries).values(timetableData);
}