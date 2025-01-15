export function assignImmediateRevisionSessions(exams, allSlots, blockOrder, assignedSlots) {
  exams.forEach((exam) => {
    const examDate = new Date(exam.examDate);
    blockOrder.forEach((block) => {
      const slot = allSlots.find(
        (s) => s.date < examDate && s.block === block && !s.assigned
      );
      if (slot) {
        slot.assigned = true;
        slot.subject = exam.subject;
        assignedSlots.add(slot.id);
      }
    });
  });
}

export function assignRemainingSlots(exams, subjectExamDates, allSlots, blockOrder) {
  allSlots.forEach((slot) => {
    if (!slot.assigned) {
      const subjects = exams.filter(
        (exam) => new Date(exam.examDate) > slot.date
      ).map((exam) => exam.subject);
      if (subjects.length > 0) {
        slot.assigned = true;
        slot.subject = subjects[Math.floor(Math.random() * subjects.length)];
      }
    }
  });
}