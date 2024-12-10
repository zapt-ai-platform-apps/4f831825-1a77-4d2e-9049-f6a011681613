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