import { createSignal, onMount, Show } from 'solid-js';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';
import { useTimetable } from '../contexts/TimetableContext';
import MonthNavigation from './MonthNavigation';
import CalendarGrid from './Timetable/CalendarGrid';
import DayDetails from './Timetable/DayDetails';
import { isSameDay } from 'date-fns';

function Timetable() {
  const { timetable, setTimetable, exams, setExams } = useTimetable();
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [currentMonth, setCurrentMonth] = createSignal(new Date());
  const [selectedDate, setSelectedDate] = createSignal(null);
  const [datesWithData, setDatesWithData] = createSignal({});
  const [maxDate, setMaxDate] = createSignal(null);

  onMount(() => {
    fetchExams().then(() => {
      fetchTimetable();
    });
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
          prepareDatesWithData(data);
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

  const fetchExams = async () => {
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
        computeMaxDate();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error fetching exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      Sentry.captureException(error);
    }
  };

  const computeMaxDate = () => {
    if (exams().length > 0) {
      const examDates = exams().map((exam) => new Date(exam.examDate));
      const lastExamDate = new Date(Math.max.apply(null, examDates));
      setMaxDate(lastExamDate);

      // If currentMonth is after maxDate, set currentMonth to maxDate
      if (currentMonth() > new Date(lastExamDate.getFullYear(), lastExamDate.getMonth(), 1)) {
        setCurrentMonth(new Date(lastExamDate.getFullYear(), lastExamDate.getMonth(), 1));
      }
    } else {
      setMaxDate(null);
    }
  };

  const prepareDatesWithData = (timetableData) => {
    const dates = {};
    // Add revision sessions
    for (const date in timetableData) {
      if (!dates[date]) dates[date] = { sessions: [], exams: [] };
      dates[date].sessions = timetableData[date];
    }
    // Add exams
    exams().forEach((exam) => {
      const date = exam.examDate;
      if (!dates[date]) dates[date] = { sessions: [], exams: [] };
      dates[date].exams.push(exam);
    });
    setDatesWithData(dates);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
    setSelectedDate(null);
  };

  const handleDateClick = (date) => {
    if (selectedDate() && isSameDay(selectedDate(), date)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };

  return (
    <div class="h-full flex flex-col text-white p-4">
      <div class="w-full max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold mb-4 text-center">Your Revision Timetable</h2>
        <Show when={!loading()} fallback={<p>Loading...</p>}>
          <Show when={!error()} fallback={<p class="text-red-500">{error()}</p>}>
            <MonthNavigation
              currentMonth={currentMonth()}
              handlePrevMonth={handlePrevMonth}
              handleNextMonth={handleNextMonth}
              maxDate={maxDate()}
            />
            <CalendarGrid
              currentMonth={currentMonth()}
              datesWithData={datesWithData()}
              selectedDate={selectedDate()}
              onDateClick={handleDateClick}
            />
            <Show when={selectedDate()}>
              <DayDetails
                date={selectedDate()}
                datesWithData={datesWithData()}
              />
            </Show>
          </Show>
        </Show>
      </div>
    </div>
  );
}

export default Timetable;