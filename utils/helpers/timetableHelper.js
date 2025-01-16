/**
 * Helper function to check if a given block (entryBlock) is the same or later
 * than another block (examBlock). We define "Morning" < "Afternoon" < "Evening".
 */
export function isBlockSameOrLater(entryBlock, examBlock) {
  const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
  return blockOrder[entryBlock] >= blockOrder[examBlock];
}