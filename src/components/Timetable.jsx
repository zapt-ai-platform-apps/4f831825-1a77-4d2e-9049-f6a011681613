import { createSignal, onMount, createMemo, createEffect, For, Show } from 'solid-js';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameDay,
  parseISO,
  isValid,
} from 'date-fns';
import { useSearchParams } from '@solidjs/router';
import { useTimetable } from '../contexts/TimetableContext';

import CalendarGrid from './CalendarGrid';
import DayDetails from './DayDetails';
import MonthNavigation from './MonthNavigation';

function Timetable() {
  const { timetable, setTimetable, exams, preferences } = useTimetable();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [currentMonth, setCurrentMonth] = createSignal(new Date());
  const [initialMonthSet, setInitialMonthSet] = createSignal(false);
  const [selectedDate, setSelectedDate] = createSignal(null);
  const [subjectColours, setSubjectColours] = createSignal({});

  const [minDate, setMinDate] = createSignal(null);
  const [maxDate, setMaxDate] = createSignal(null);

  const examsByDate = createMemo(() => {
    const examsData = exams();
    const examsByDateMap = {};
    if (Array.isArray(examsData)) {
      examsData.forEach((exam) => {
        const examDate = exam.examDate;
        if (!examsByDateMap[examDate]) {
          examsByDateMap[examDate] = [];
        }
        examsByDateMap[examDate].push(exam);
      });
    }
    return examsByDateMap;
  });

  const orderedSubjects = createMemo(() => {
    if (Array.isArray(exams())) {
      return exams().map((exam) => exam.subject);
    }
    return [];
  });

  const getCalendarDays = createMemo(() => {
    const startDate = startOfMonth(currentMonth());
    const endDate = endOfMonth(currentMonth());

    if (!isValid(startDate) || !isValid(endDate)) {
      return [];
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = [];
    let week = [];

    let firstDayOfWeek = getDay(startDate);
    firstDayOfWeek = (firstDayOfWeek + 6) % 7;

    for (let i = 0; i < firstDayOfWeek; i++) {
      week.push(null);
    }

    days.forEach((day) => {
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      week.push(day);
    });

    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    return weeks;
  });

  const handlePrevMonth = () => {
    const prevMonth = subMonths(currentMonth(), 1);
    if (!minDate() || prevMonth >= startOfMonth(minDate())) {
      setCurrentMonth(prevMonth);
      setSelectedDate(null);
    }
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth(), 1);
    if (!maxDate() || nextMonth <= startOfMonth(maxDate())) {
      setCurrentMonth(nextMonth);
      setSelectedDate(null);
    }
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const dateKey = format(day, 'yyyy-MM-dd');
    if (selectedDate() === dateKey) {
      setSelectedDate(null);
    } else {
      setSelectedDate(dateKey);
    }
  };

  const sessions = createMemo(() => {
    const dateKey = selectedDate();
    if (dateKey && timetable() && timetable()[dateKey]) {
      return timetable()[dateKey];
    }
    return [];
  });

  const dayExams = createMemo(() => {
    const dateKey = selectedDate();
    if (dateKey && Array.isArray(exams())) {
      return exams().filter((exam) => exam.examDate === dateKey);
    }
    return [];
  });

  createEffect(() => {
    if (Array.isArray(exams())) {
      const colours = {};
      const colourPalette = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FF8C33', '#33FFF9', '#8D33FF', '#FF3333', '#33FF8C', '#FF33FF'];
      let colourIndex = 0;
      orderedSubjects().forEach((subject) => {
        if (!colours[subject]) {
          colours[subject] = colourPalette[colourIndex % colourPalette.length];
          colourIndex++;
        }
      });
      setSubjectColours(colours);
    }
  });

  onMount(() => {
    const dateParam = searchParams.date;
    if (dateParam) {
      const date = parseISO(dateParam);
      if (isValid(date)) {
        setCurrentMonth(startOfMonth(date));
        setInitialMonthSet(true);
      }
    }

    const regenerate = searchParams.regenerate === 'true';
    if (regenerate) {
      generateAndFetchTimetable();
    } else {
      fetchTimetable();
    }
  });

  createEffect(() => {
    if (!initialMonthSet() && preferences() && preferences().startDate) {
      const startDate = parseISO(preferences().startDate);
      if (isValid(startDate)) {
        setCurrentMonth(startOfMonth(startDate));
        setInitialMonthSet(true);
      }
    }
  });

  const fetchTimetable = async () => {
    setLoading(true);
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

          // Compute minDate and maxDate
          const dates = Object.keys(data);
          if (dates.length > 0) {
            const parsedDates = dates.map(dateString => parseISO(dateString));
            const earliestDate = parsedDates.reduce((a, b) => (a < b ? a : b));
            const latestDate = parsedDates.reduce((a, b) => (a > b ? a : b));
            setMinDate(earliestDate);
            setMaxDate(latestDate);
          }
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
    } finally {
      setLoading(false);
    }
  };

  const generateAndFetchTimetable = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const generateResponse = await fetch('/api/generateTimetable', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });
      if (generateResponse.ok) {
        await fetchTimetable();
      } else {
        const errorText = await generateResponse.text();
        throw new Error(errorText || 'Error generating timetable');
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      Sentry.captureException(error);
      setError(error.message || 'Error generating timetable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="h-full flex flex-col text-white">
      <div class="flex-grow p-4">
        <div class="w-full max-w-4xl mx-auto">
          <h2 class="text-2xl font-bold mb-4 text-center">Your Revision Timetable</h2>
          <Show when={!loading()}>
            <Show when={!error()}>
              <div class="mb-4">
                <h3 class="text-xl font-semibold mb-2 text-center">Your Exams</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <For each={exams()}>
                    {(exam) => (
                      <div class="bg-white text-black p-4 rounded-lg shadow-md">
                        <p class="font-semibold">{exam.subject}</p>
                        <p>Exam Date: {exam.examDate}</p>
                        <p>Board: {exam.board}</p>
                        <p>Teacher: {exam.teacher}</p>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>
          </Show>
          <div class="mb-2">
            <h3 class="text-xl font-semibold text-center">{format(currentMonth(), 'MMMM yyyy')}</h3>
          </div>
          <p class="text-center mb-4">Please select a day on the timetable to view its details.</p>
          <div class="w-full flex justify-center">
            <div class="w-full sm:w-96 md:w-[32rem] lg:w-[36rem]">
              {!loading() ? (
                !error() ? (
                  <CalendarGrid
                    getCalendarDays={getCalendarDays}
                    handleDateClick={handleDateClick}
                    selectedDate={selectedDate}
                    timetable={timetable}
                    examsByDate={examsByDate}
                    subjectColours={subjectColours}
                  />
                ) : (
                  <p class="text-red-500">{error()}</p>
                )
              ) : (
                <p>Loading timetable...</p>
              )}
            </div>
          </div>
          <MonthNavigation
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
            minDate={minDate}
            maxDate={maxDate}
            currentMonth={currentMonth}
          />
          <DayDetails
            selectedDate={selectedDate}
            dayExams={dayExams}
            sessions={sessions}
            subjectColours={subjectColours}
          />
        </div>
      </div>
    </div>
  );
}

export default Timetable;