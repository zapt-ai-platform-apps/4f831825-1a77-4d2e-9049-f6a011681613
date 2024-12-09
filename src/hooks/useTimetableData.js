import { createSignal, onMount } from 'solid-js';
import { useTimetable } from '../contexts/TimetableContext';
import { fetchTimetable, fetchExams, prepareDatesWithData, computeMaxDate } from '../utils/timetableUtils';

export function useTimetableData(currentMonth, setCurrentMonth) {
  const { timetable, setTimetable, exams, setExams } = useTimetable();
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [datesWithData, setDatesWithData] = createSignal({});
  const [maxDate, setMaxDate] = createSignal(null);
  const [subjectColours, setSubjectColours] = createSignal({});

  onMount(() => {
    fetchData();
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchExams(setExams);
      computeMaxDate(exams, setMaxDate, currentMonth, setCurrentMonth);
      await fetchTimetable(setTimetable, setError);
      prepareDatesWithData(timetable, exams, setDatesWithData, setSubjectColours);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    datesWithData,
    maxDate,
    subjectColours,
    fetchData,
  };
}