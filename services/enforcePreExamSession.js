/**
 * Enforces that there is at least one revision session immediately before each exam.
 * If not, it adds a session in the prior Evening block or the previous day’s Evening block.
 * @param {Array} finalSessions - Array of scheduled session objects.
 * @param {Array} userExams - Array of exam objects.
 */
export function enforcePreExamSession(finalSessions, userExams) {
  const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
  const sessionMap = finalSessions.reduce((acc, session) => {
    if (!acc[session.date]) acc[session.date] = {};
    acc[session.date][session.block] = session.subject;
    return acc;
  }, {});

  userExams.forEach(exam => {
    const examDate = exam.examDate;
    const examBlock = exam.timeOfDay;

    // Determine the required pre-exam block
    let requiredPreBlockPriority = blockOrder[examBlock] - 1;
    let requiredPreBlock = Object.keys(blockOrder).find(key => blockOrder[key] === requiredPreBlockPriority);
    
    if (!requiredPreBlock) {
      // If no earlier block on the same day, fallback to Evening block of the previous day
      const examDateObj = new Date(examDate);
      examDateObj.setDate(examDateObj.getDate() - 1);
      const previousDay = examDateObj.toISOString().split('T')[0];
      requiredPreBlock = 'Evening';
      // Check if a session already exists
      if (!sessionMap[previousDay] || !sessionMap[previousDay][requiredPreBlock]) {
        finalSessions.push({
          date: previousDay,
          block: requiredPreBlock,
          subject: exam.subject
        });
      }
      return;
    }

    // Check if the required pre-exam session exists
    if (!sessionMap[examDate] || !sessionMap[examDate][requiredPreBlock]) {
      finalSessions.push({
        date: examDate,
        block: requiredPreBlock,
        subject: exam.subject
      });
    }
  });
}