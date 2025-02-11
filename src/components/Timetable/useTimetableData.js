import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import useTimetableState from '../../hooks/useTimetableState';
import { useTimetable } from '../../contexts/TimetableContext';
import { computeMaxDate, prepareDatesWithData } from '../../utils/dateUtils';

function useTimetableData() {
  const {
    currentMonth,
    setCurrentMonth,
    selectedDate,
    handlePrevMonth,
    handleNextMonth,
    handleDateClick,
  } = useTimetableState();

  const { timetable, exams, preferences } = useTimetable();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datesWithData, setDatesWithData] = useState({});
  const [maxDate, setMaxDate] = useState(null);
  const [subjectColours, setSubjectColours] = useState({});

  const refreshTimetableData = async () => {
    console.log('[INFO] Refreshing timetable data...');
    setLoading(true);
    try {
      computeMaxDate(exams, setMaxDate, currentMonth, setCurrentMonth);
      prepareDatesWithData(timetable, exams, setDatesWithData, setSubjectColours);
    } catch (err) {
      console.error('[ERROR] Failed to load timetable data:', err);
      Sentry.captureException(err);
      setError('Failed to load timetable data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!preferences) {
      setLoading(false);
      return;
    }
    refreshTimetableData();
    // Removed exams?.length from dependencies to avoid repeated fetching.
  }, [currentMonth]); // eslint-disable-line react-hooks/exhaustive-deps

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