import { createSignal, onMount, createMemo, createEffect } from 'solid-js';
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
    setCurrentMonth(subMonths(currentMonth(), 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth(), 1));
    setSelectedDate(null);
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