export function generateTimetable(preferences, exams, revisionTimes) {
  const { startDate, userId } = preferences;

  const dateCursor = new Date(startDate);
  if (isNaN(dateCursor)) {
    throw new Error("Invalid start date");
  }

  // Sort exams by date
  exams.sort((a, b) => new Date(a.examDate) - new Date(b.examDate));

  // Map exams by date and block
  const examsByDateBlock = {};
  exams.forEach((exam) => {
    const examDateStr = exam.examDate;
    const block = exam.timeOfDay || "Morning";
    if (!examsByDateBlock[examDateStr]) {
      examsByDateBlock[examDateStr] = new Set();
    }
    examsByDateBlock[examDateStr].add(block);
  });

  // Map revision times by day of week
  const revisionTimesMap = {};
  revisionTimes.forEach((item) => {
    const day = item.dayOfWeek.toLowerCase();
    if (!revisionTimesMap[day]) {
      revisionTimesMap[day] = [];
    }
    revisionTimesMap[day].push(item.block);
  });

  // Valid time blocks and their order
  const blockOrder = ["Morning", "Afternoon", "Evening"];

  // Map blocks to start and end times
  const blockTimes = {
    Morning: { start: "09:00", end: "13:00" },
    Afternoon: { start: "14:00", end: "17:00" },
    Evening: { start: "18:00", end: "21:00" },
  };

  // Generate dates from startDate to lastExamDate
  const examDates = exams.map((exam) => new Date(exam.examDate));
  const lastExamDate = new Date(Math.max.apply(null, examDates));

  const allSlots = [];

  let currentDate = new Date(dateCursor);
  while (currentDate <= lastExamDate) {
    const currentDateStr = currentDate.toISOString().split("T")[0];

    // Get the day of week
    const dayOfWeek = currentDate
      .toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" })
      .toLowerCase();

    // Get available blocks for that day
    const dayBlocks = revisionTimesMap[dayOfWeek] || [];
    let availableBlocks = dayBlocks.filter((block) =>
      blockOrder.includes(block)
    );

    // Exclude blocks after the last exam time on the last exam date
    if (currentDateStr === lastExamDate.toISOString().split("T")[0]) {
      const lastExam = exams[exams.length - 1];
      const lastExamBlockIndex = blockOrder.indexOf(
        lastExam.timeOfDay || "Morning"
      );
      availableBlocks = availableBlocks.filter((block) => {
        const blockIndex = blockOrder.indexOf(block);
        return blockIndex < lastExamBlockIndex;
      });
    }

    // Exclude blocks where exams are scheduled
    const examBlocks = examsByDateBlock[currentDateStr] || new Set();
    const filteredBlocks = availableBlocks.filter(
      (block) => !examBlocks.has(block)
    );

    // Include only the filtered blocks
    const orderedBlocks = ["Evening", "Afternoon", "Morning"];
    const sortedBlocks = orderedBlocks.filter((block) =>
      filteredBlocks.includes(block)
    );

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

  // Build a mapping of subject exam dates
  const subjectExamDates = {};
  exams.forEach((exam) => {
    subjectExamDates[exam.subject.trim()] = new Date(exam.examDate);
  });

  // Assign immediate revision sessions before exams
  const assignedSlots = new Set();
  exams.forEach((exam, index) => {
    let revisionSlot = null;
    const examDate = new Date(exam.examDate);
    const examDateStr = examDate.toISOString().split("T")[0];
    const examBlockIndex = blockOrder.indexOf(exam.timeOfDay || "Morning");

    // Find the latest available slot before the exam
    for (let i = 0; i < allSlots.length; i++) {
      const slot = allSlots[i];
      if (assignedSlots.has(i)) continue;

      const slotDate = new Date(slot.date);
      const slotBlockIndex = blockOrder.indexOf(slot.block);

      if (
        slotDate < examDate ||
        (slotDate.toISOString().split("T")[0] === examDateStr &&
          slotBlockIndex < examBlockIndex)
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
            (slotDate.toISOString().split("T")[0] === prevExam.examDate &&
              slotBlockIndex <
                blockOrder.indexOf(prevExam.timeOfDay || "Morning"))
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

  // Assign remaining slots to subjects whose exams are in the future
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

  const timetableEntriesData = allSlots
    .filter((slot) => slot.assigned && slot.subject)
    .map((slot) => {
      const times = blockTimes[slot.block] || {};
      return {
        userId: userId,
        date: slot.date,
        block: slot.block,
        subject: slot.subject,
        startTime: times.start,
        endTime: times.end,
      };
    });

  return timetableEntriesData;
}