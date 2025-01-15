export function prepareExamsData(userExams) {
  return userExams.map((e) => ({
    subject: e.subject,
    examDate: e.examDate,
    timeOfDay: e.timeOfDay,
  }));
}

export function prepareRevisionTimes(revisionTimesResult) {
  const revisionTimes = {};
  for (const row of revisionTimesResult) {
    if (!revisionTimes[row.dayOfWeek]) {
      revisionTimes[row.dayOfWeek] = [];
    }
    revisionTimes[row.dayOfWeek].push(row.block);
  }
  return revisionTimes;
}