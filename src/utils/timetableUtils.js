import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';

export const fetchTimetable = async (setTimetable, setError) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch('/api/getTimetable', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const { data } = await response.json();
      if (data) {
        setTimetable(data);
      } else {
        setTimetable({});
      }
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Error fetching timetable');
    }
  } catch (error) {
    console.error('Error fetching timetable:', error);
    Sentry.captureException(error);
    setError(error.message || 'Error fetching timetable');
  }
};

export const fetchExams = async (setExams) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const response = await fetch('/api/getExams', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const { data } = await response.json();
      if (data) {
        setExams(data);
      } else {
        setExams([]);
      }
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Error fetching exams');
    }
  } catch (error) {
    console.error('Error fetching exams:', error);
    Sentry.captureException(error);
  }
};

export const computeMaxDate = (exams, setMaxDate, currentMonth, setCurrentMonth) => {
  if (exams().length > 0) {
    const examDates = exams().map((exam) => new Date(exam.examDate));
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
  const dates = {};
  const subjectsSet = new Set();

  const timetableData = timetable();

  // Add revision sessions
  for (const date in timetableData) {
    if (!dates[date]) dates[date] = { sessions: [], exams: [] };
    dates[date].sessions = timetableData[date];

    timetableData[date].forEach((session) => {
      subjectsSet.add(session.subject);
    });
  }

  // Add exams
  exams().forEach((exam) => {
    const date = exam.examDate;
    if (!dates[date]) dates[date] = { sessions: [], exams: [] };
    dates[date].exams.push(exam);

    subjectsSet.add(exam.subject);
  });

  setDatesWithData(dates);

  // Generate subjectColours mapping
  const uniqueSubjects = Array.from(subjectsSet);
  const colours = [
    '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
  ];

  const subjectColourMap = {};
  uniqueSubjects.forEach((subject, index) => {
    subjectColourMap[subject] = colours[index % colours.length];
  });

  setSubjectColours(subjectColourMap);
};