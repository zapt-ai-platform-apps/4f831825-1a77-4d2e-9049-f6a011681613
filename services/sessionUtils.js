export function sortBlankSessions(blankSessions) {
  const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
  return blankSessions.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA - dateB !== 0) {
      return dateA - dateB;
    }
    return blockOrder[a.block] - blockOrder[b.block];
  });
}

export function getAvailableSubjects(examDatesMap, sessionDateObj) {
  return examDatesMap
    .filter((exam) => exam.examDateObj >= sessionDateObj)
    .map((exam) => exam.subject);
}

export function chooseSubject(availableSubjects, assignedCount) {
  let chosenSubject = null;
  let minCount = Infinity;
  for (const subject of availableSubjects) {
    const count = assignedCount[subject] || 0;
    if (count < minCount) {
      minCount = count;
      chosenSubject = subject;
    }
  }
  return chosenSubject;
}