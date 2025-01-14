import { useState, useEffect } from 'react';
import useTimetableState from '../../hooks/useTimetableState';
import { useTimetable } from '../../contexts/TimetableContext';
import { computeMaxDate, prepareDatesWithData, fetchTimetable, fetchExams } from '../../utils/timetableUtils';

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
    console.log('[INFO] Refreshing timetable data...');
    setLoading(true);
    try {
      // Fetch exams
      const examResult = await fetchExams();
      setExams(examResult);

      // Compute max date based on newly fetched exams
      computeMaxDate(examResult, setMaxDate, currentMonth, setCurrentMonth);

      // Fetch timetable
      const timetableResult = await fetchTimetable();
      setTimetable(timetableResult);

      // Prepare combined data
      prepareDatesWithData(timetableResult, examResult, setDatesWithData, setSubjectColours);

    } catch (err) {
      console.error('[ERROR] Failed to load timetable data:', err);
      setError('Failed to load timetable data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If we have no user or no preferences yet, skip
    if (!preferences) {
      setLoading(false);
      return;
    }
    refreshTimetableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  // Removed useEffect that depended on exams.length

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