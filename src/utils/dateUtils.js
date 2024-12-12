export const computeMaxDate = (exams, setMaxDate, currentMonth, setCurrentMonth) => {
  if (exams.length > 0) {
    const examDates = exams.map((exam) => new Date(exam.examDate));
    const lastExamDate = new Date(Math.max.apply(null, examDates));
    setMaxDate(lastExamDate);

    if (currentMonth() > new Date(lastExamDate.getFullYear(), lastExamDate.getMonth(), 1)) {
      setCurrentMonth(new Date(lastExamDate.getFullYear(), lastExamDate.getMonth(), 1));
    }
  } else {
    setMaxDate(null);
  }
};

export const prepareDatesWithData = (timetable, exams, setDatesWithData, setSubjectColours) => {
  const datesWithData = {};
  const subjectsSet = new Set();

  for (const dateStr in timetable) {
    const sessions = timetable[dateStr];
    datesWithData[dateStr] = datesWithData[dateStr] || { sessions: [], exams: [] };
    for (const session of sessions) {
      datesWithData[dateStr].sessions.push(session);
      subjectsSet.add(session.subject);
    }
  }

  for (const exam of exams) {
    const dateStr = exam.examDate;
    datesWithData[dateStr] = datesWithData[dateStr] || { sessions: [], exams: [] };
    datesWithData[dateStr].exams.push(exam);
    subjectsSet.add(exam.subject);
  }

  const subjectColours = {};
  const colors = [
    '#00d2ff', // Light Blue
    '#0083b0', // Dark Blue
    '#8e44ad', // Purple
    '#3c3b3f', // Gray
    '#11998e', // Teal
    '#38ef7d', // Light Green
    '#b1ea4d', // Yellow Green
  ];

  let colorIndex = 0;
  for (const subject of subjectsSet) {
    subjectColours[subject] = colors[colorIndex % colors.length];
    colorIndex++;
  }

  setDatesWithData(datesWithData);
  setSubjectColours(subjectColours);
};