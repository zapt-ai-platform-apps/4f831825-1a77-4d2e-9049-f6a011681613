import { useState, useEffect } from 'react';
import useTimetableState from '../../hooks/useTimetableState';
import { useTimetable } from '../../contexts/TimetableContext';
import { fetchTimetable, fetchExams } from '../../api';
import { prepareDatesWithData, computeMaxDate } from '../../utils/dateUtils';

function useTimetableData() {
  const {
    currentMonth,
    setCurrentMonth,
    selectedDate,
    handlePrevMonth,
    handleNextMonth,
    handleDateClick,
  } = useTimetableState();
  const { timetable, setTimetable, exams, setExams, preferences } = useTimetable();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datesWithData, setDatesWithData] = useState({});
  const [maxDate, setMaxDate] = useState(null);
  const [subjectColours, setSubjectColours] = useState({});

  const refreshTimetableData = async () => {
    setLoading(true);
    try {
      await fetchExams(setExams);
      computeMaxDate(exams, setMaxDate, currentMonth, setCurrentMonth);
      await fetchTimetable(setTimetable, setError);
      prepareDatesWithData(timetable, exams, setDatesWithData, setSubjectColours);
    } catch (err) {
      setError('Failed to load timetable data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTimetableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, exams]);

  return {
    currentMonth,
    setCurrentMonth,
    selectedDate,
    handlePrevMonth,
    handleNextMonth,
    handleDateClick,
    loading,
    error,
    datesWithData,
    maxDate,
    subjectColours,
    refreshTimetableData,
  };
}

export default useTimetableData;