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
    '#ff7e5f',
    '#feb47b',
    '#ff6a88',
    '#00d2ff',
    '#0083b0',
    '#8e44ad',
    '#3c3b3f',
    '#11998e',
    '#38ef7d',
    '#b1ea4d',
  ];

  let colorIndex = 0;
  for (const subject of subjectsSet) {
    subjectColours[subject] = colors[colorIndex % colors.length];
    colorIndex++;
  }

  setDatesWithData(datesWithData);
  setSubjectColours(subjectColours);
};