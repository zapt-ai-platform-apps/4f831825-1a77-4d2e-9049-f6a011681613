import {
  preferences,
  exams,
  revisionTimes,
  timetableEntries,
  blockTimes,
} from "../drizzle/schema.js";
import { eq, and, not } from "drizzle-orm";

export async function deleteUserTimetableEntries(db, userId) {
  await db.delete(timetableEntries).where(eq(timetableEntries.userId, userId));
}

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

// ... rest remains the same