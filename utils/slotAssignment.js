export function generateAllSlots(
  startDate,
  lastExamDate,
  revisionTimesMap,
  blockTimesMap,
  examsByDateBlock,
  blockOrder,
  exams
) {
  const allSlots = [];
  let currentDate = new Date(startDate);
  while (currentDate <= lastExamDate) {
    const currentDateStr = currentDate.toISOString().split('T')[0];

    // Get the day of week
    const dayOfWeek = currentDate
      .toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
      .toLowerCase();

    // Get available blocks for that day
    const dayBlocks = revisionTimesMap[dayOfWeek] || [];
    let availableBlocks = dayBlocks.filter((block) => blockOrder.includes(block));

    // Exclude blocks after the last exam time on the last exam date
    if (currentDateStr === lastExamDate.toISOString().split('T')[0]) {
      const lastExam = exams[exams.length - 1];
      const lastExamBlockIndex = blockOrder.indexOf(lastExam.timeOfDay || 'Morning');
      availableBlocks = availableBlocks.filter((block) => {
        const blockIndex = blockOrder.indexOf(block);
        return blockIndex < lastExamBlockIndex;
      });
    }

    // Exclude blocks where exams are scheduled
    const examBlocks = examsByDateBlock[currentDateStr] || new Set();
    const filteredBlocks = availableBlocks.filter((block) => !examBlocks.has(block));

    // Include only the filtered blocks
    const sortedBlocks = blockOrder.filter((block) => filteredBlocks.includes(block));

    for (const block of sortedBlocks) {
      allSlots.push({
        date: currentDateStr,
        block,
        assigned: false,
        subject: null,
      });
    }

    // Move to next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return allSlots;
}

export function assignImmediateRevisionSessions(exams, allSlots, blockOrder, assignedSlots) {
  exams.forEach((exam, index) => {
    let revisionSlot = null;
    const examDate = new Date(exam.examDate);
    const examDateStr = examDate.toISOString().split('T')[0];
    const examBlockIndex = blockOrder.indexOf(exam.timeOfDay || 'Morning');

    // Find the latest available slot before the exam
    for (let i = 0; i < allSlots.length; i++) {
      const slot = allSlots[i];
      if (assignedSlots.has(i)) continue;

      const slotDate = new Date(slot.date);
      const slotBlockIndex = blockOrder.indexOf(slot.block);

      if (
        slotDate < examDate ||
        (slotDate.toISOString().split('T')[0] === examDateStr && slotBlockIndex < examBlockIndex)
      ) {
        if (
          !revisionSlot ||
          slotDate > new Date(revisionSlot.date) ||
          (slotDate.getTime() === new Date(revisionSlot.date).getTime() &&
            slotBlockIndex > blockOrder.indexOf(revisionSlot.block))
        ) {
          revisionSlot = slot;
        }
      }
    }

    if (revisionSlot) {
      const slotIndex = allSlots.indexOf(revisionSlot);
      assignedSlots.add(slotIndex);
      revisionSlot.assigned = true;
      revisionSlot.subject = exam.subject;
    }

    // Handle consecutive exams
    if (index > 0) {
      const prevExam = exams[index - 1];
      const daysBetweenExams =
        (examDate - new Date(prevExam.examDate)) / (1000 * 60 * 60 * 24);
      if (daysBetweenExams === 1) {
        let prevRevisionSlot = null;
        for (let i = 0; i < allSlots.length; i++) {
          const slot = allSlots[i];
          if (assignedSlots.has(i)) continue;

          const slotDate = new Date(slot.date);
          const slotBlockIndex = blockOrder.indexOf(slot.block);

          if (
            slotDate < new Date(prevExam.examDate) ||
            (slotDate.toISOString().split('T')[0] === prevExam.examDate &&
              slotBlockIndex < blockOrder.indexOf(prevExam.timeOfDay || 'Morning'))
          ) {
            if (
              !prevRevisionSlot ||
              slotDate > new Date(prevRevisionSlot.date) ||
              (slotDate.getTime() === new Date(prevRevisionSlot.date).getTime() &&
                slotBlockIndex > blockOrder.indexOf(prevRevisionSlot.block))
            ) {
              prevRevisionSlot = slot;
            }
          }
        }

        if (prevRevisionSlot) {
          const slotIndex = allSlots.indexOf(prevRevisionSlot);
          assignedSlots.add(slotIndex);
          prevRevisionSlot.assigned = true;
          prevRevisionSlot.subject = exam.subject;
        }
      }
    }
  });
}

export function assignRemainingSlots(exams, subjectExamDates, allSlots, blockOrder) {
  let subjectIndex = 0;

  for (let i = 0; i < allSlots.length; i++) {
    const slot = allSlots[i];
    if (slot.assigned) continue;
    const slotDate = new Date(slot.date);

    const subjectsToRevise = exams
      .map((exam) => exam.subject.trim())
      .filter((subject) => subjectExamDates[subject] > slotDate);

    if (subjectsToRevise.length === 0) {
      continue; // No more subjects to revise
    }

    const subject = subjectsToRevise[subjectIndex % subjectsToRevise.length];
    slot.subject = subject;
    slot.assigned = true;
    subjectIndex++;
  }
}