export function mapRevisionTimesByDay(revisionTimes) {
  const revisionTimesMap = {};
  revisionTimes.forEach((item) => {
    const day = item.dayOfWeek.toLowerCase();
    if (!revisionTimesMap[day]) {
      revisionTimesMap[day] = [];
    }
    revisionTimesMap[day].push(item.block);
  });
  return revisionTimesMap;
}

export function getBlockTimes(blockTimes, blockOrder) {
  const defaultBlockTimes = {
    Morning: { startTime: '09:00', endTime: '13:00' },
    Afternoon: { startTime: '14:00', endTime: '17:00' },
    Evening: { startTime: '18:00', endTime: '21:00' },
  };

  const blockTimesMap = {};
  for (const block of blockOrder) {
    blockTimesMap[block] = blockTimes[block] || defaultBlockTimes[block];
  }
  return blockTimesMap;
}