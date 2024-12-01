import { createSignal, onMount, For, Show } from 'solid-js';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';
import {
  format,
  parseISO,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  getDay,
  isSameDay,
} from 'date-fns';
import { useSearchParams } from '@solidjs/router';
import { useTimetable } from '../contexts/TimetableContext';

function Timetable() {
  const { timetable, setTimetable, exams } = useTimetable();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [currentMonth, setCurrentMonth] = createSignal(new Date());
  const [selectedDate, setSelectedDate] = createSignal(null);
  const [datesWithData, setDatesWithData] = createSignal({});

  onMount(() => {
    const regenerate = searchParams.regenerate === 'true';
    if (regenerate) {
      generateAndFetchTimetable();
    } else {
      fetchTimetable();
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
          prepareDatesWithData(data);
        } else {
          setTimetable({});
        }
        setLoading(false);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error fetching timetable');
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      Sentry.captureException(error);
      setError(error.message || 'Error fetching timetable');
      setLoading(false);
    }
  };

  const generateAndFetchTimetable = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const generateResponse = await fetch('/api/generateTimetable', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (generateResponse.ok) {
        await fetchTimetable();
      } else {
        const errorText = await generateResponse.text();
        throw new Error(errorText || 'Error generating timetable');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      Sentry.captureException(error);
      setError(error.message || 'Error generating timetable');
      setLoading(false);
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

  const daysInMonth = () => {
    const start = startOfMonth(currentMonth());
    const end = endOfMonth(currentMonth());
    const days = eachDayOfInterval({ start, end });
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth(), 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth(), 1));
    setSelectedDate(null);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const isToday = (date) => {
    return isSameDay(date, new Date());
  };

  const startDayOfWeek = () => {
    return getDay(startOfMonth(currentMonth()));
  };

  return (
    <div class="h-full flex flex-col text-white p-4">
      <div class="w-full max-w-4xl mx-auto">
        <h2 class="text-2xl font-bold mb-4 text-center">Your Revision Timetable</h2>
        <Show when={!loading()} fallback={<p>Loading...</p>}>
          <Show when={!error()} fallback={<p class="text-red-500">{error()}</p>}>
            <div class="flex items-center justify-between mb-4">
              <button
                class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                onClick={handlePrevMonth}
              >
                Previous
              </button>
              <h3 class="text-xl font-semibold">{format(currentMonth(), 'MMMM yyyy')}</h3>
              <button
                class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                onClick={handleNextMonth}
              >
                Next
              </button>
            </div>
            <div class="grid grid-cols-7 gap-2 mb-4">
              {/* Weekday headers */}
              <For each={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}>
                {(day) => (
                  <div class="text-center font-semibold">{day}</div>
                )}
              </For>
              {/* Empty cells for days before the first of the month */}
              <For each={Array((startDayOfWeek() + 6) % 7).fill(null)}>
                {() => (
                  <div></div>
                )}
              </For>
              {/* Days of the month */}
              <For each={daysInMonth()}>
                {(day) => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dataForDay = datesWithData()[dateKey] || { sessions: [], exams: [] };
                  return (
                    <div
                      class={`border p-1 rounded-lg cursor-pointer ${
                        isToday(day) ? 'bg-blue-800' : 'bg-white text-black'
                      }`}
                      onClick={() => handleDateClick(day)}
                    >
                      <div class="font-bold text-center">{format(day, 'd')}</div>
                      <Show when={dataForDay.exams.length > 0}>
                        <div class="text-xs text-red-600 font-semibold">Exam</div>
                      </Show>
                      <Show when={dataForDay.sessions.length > 0}>
                        <div class="text-xs text-green-600 font-semibold">Revision</div>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
            <Show when={selectedDate()}>
              <div class="bg-white text-black p-4 rounded-lg">
                <h3 class="text-xl font-bold mb-2">
                  Details for {format(selectedDate(), 'MMMM d, yyyy')}
                </h3>
                <div>
                  <Show when={datesWithData()[format(selectedDate(), 'yyyy-MM-dd')]}>
                    <Show
                      when={
                        datesWithData()[format(selectedDate(), 'yyyy-MM-dd')].exams.length > 0
                      }
                    >
                      <h4 class="font-semibold">Exams:</h4>
                      <For each={datesWithData()[format(selectedDate(), 'yyyy-MM-dd')].exams}>
                        {(exam) => (
                          <div class="mb-2">
                            <p>{exam.subject}</p>
                            <p>Board: {exam.board}</p>
                            <p>Teacher: {exam.teacher}</p>
                          </div>
                        )}
                      </For>
                    </Show>
                    <Show
                      when={
                        datesWithData()[format(selectedDate(), 'yyyy-MM-dd')].sessions.length > 0
                      }
                    >
                      <h4 class="font-semibold">Revision Sessions:</h4>
                      <For each={datesWithData()[format(selectedDate(), 'yyyy-MM-dd')].sessions}>
                        {(session) => (
                          <div class="mb-2">
                            <p>Subject: {session.subject}</p>
                            <p>Block: {session.block}</p>
                          </div>
                        )}
                      </For>
                    </Show>
                    <Show
                      when={
                        datesWithData()[format(selectedDate(), 'yyyy-MM-dd')].exams.length === 0 &&
                        datesWithData()[format(selectedDate(), 'yyyy-MM-dd')].sessions.length === 0
                      }
                    >
                      <p>No events for this day.</p>
                    </Show>
                  </Show>
                </div>
              </div>
            </Show>
          </Show>
        </Show>
      </div>
    </div>
  );
}

export default Timetable;