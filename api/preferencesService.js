import { db } from "../src/modules/core/internal/dbClient.js";
import { preferences, revisionTimes, timetableEntries, blockTimes } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

export async function deleteUserData(userId) {
  await db.delete(preferences).where(eq(preferences.userId, userId));
  await db.delete(revisionTimes).where(eq(revisionTimes.userId, userId));
  await db.delete(blockTimes).where(eq(blockTimes.userId, userId));
  await db.delete(timetableEntries).where(eq(timetableEntries.userId, userId));
}

export async function insertPreferences(userId, data) {
  await db.insert(preferences).values({
    userId: userId,
    startDate: data.startDate,
  });
}

export async function insertRevisionTimes(userId, data) {
  const revisionTimesData = [];
  for (const [day, blocks] of Object.entries(data.revisionTimes)) {
    for (const block of blocks) {
      revisionTimesData.push({
        userId: userId,
        dayOfWeek: day,
        block: block,
      });
    }
  }
  if (revisionTimesData.length > 0) {
    await db.insert(revisionTimes).values(revisionTimesData);
  }
}

export async function insertBlockTimes(userId, data) {
  const validBlocks = ['Morning', 'Afternoon', 'Evening'];
  const blockTimesDataArr = [];
  for (const block of validBlocks) {
    const blockTime = data.blockTimes[block];
    if (blockTime && blockTime.startTime && blockTime.endTime) {
      blockTimesDataArr.push({
        userId: userId,
        blockName: block,
        startTime: blockTime.startTime,
        endTime: blockTime.endTime,
      });
    } else {
      const defaultTimes = {
        Morning: { startTime: '09:00', endTime: '13:00' },
        Afternoon: { startTime: '14:00', endTime: '17:00' },
        Evening: { startTime: '19:00', endTime: '21:00' },
      };
      blockTimesDataArr.push({
        userId: userId,
        blockName: block,
        startTime: defaultTimes[block].startTime,
        endTime: defaultTimes[block].endTime,
      });
    }
  }
  await db.insert(blockTimes).values(blockTimesDataArr);
}