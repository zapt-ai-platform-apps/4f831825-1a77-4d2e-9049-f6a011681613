```jsx
import { createSignal, onMount, For, Show } from 'solid-js';
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
} from 'date-fns';

function Timetable() {
  const [timetable, setTimetable] = createSignal({});
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);
  const [currentMonth, setCurrentMonth] = createSignal(new Date());
  const [selectedDate, setSelectedDate] = createSignal(null);
  const [sessionsForSelectedDate, setSessionsForSelectedDate] = createSignal([]);

  const fetchSavedTimetable = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Fetch saved timetable
      const response = await fetch('/api/getTimetable', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        if (data) {
          // Transform timetable into a date-keyed object for easy access
          const timetableData = {};
          data.forEach((day) => {
            timetableData[day.date] = day;
          });
          setTimetable(timetableData);
        } else {
          setError('No timetable data found.');
        }
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error fetching timetable');
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError(error.message);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const getCalendarDays = () => {
    const startDate = startOfMonth(currentMonth());
    const endDate = endOfMonth(currentMonth());
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = [];
    let week = [];

    let firstDayOfWeek = getDay(startDate); // 0 (Sunday) to 6 (Saturday)
    // Adjust so that week starts on Monday (1) instead of Sunday (0)
    firstDayOfWeek = (firstDayOfWeek + 6) % 7;

    // Add empty days at the start of the first week
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

    // Add empty days at the end of the last week
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }

    return weeks;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth(), 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth(), 1));
  };

  const handleDateClick = (day) => {
    setSelectedDate(day);
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayData = timetable()[dateKey];
    setSessionsForSelectedDate(dayData ? dayData.sessions : []);
  };

  onMount(() => {
    fetchSavedTimetable();
  });

  return (
    <div class="min-h-screen flex flex-col text-white">
      <div class="flex-grow p-4">
        <div class="w-full max-w-full sm:max-w-6xl mx-auto">
          <h2 class="text-2xl font-bold mb-4">Your Revision Timetable</h2>
          <div class="flex justify-between items-center mb-4">
            <button
              class="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handlePrevMonth}
            >
              Previous
            </button>
            <h3 class="text-xl font-semibold">
              {format(currentMonth(), 'MMMM yyyy')}
            </h3>
            <button
              class="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleNextMonth}
            >
              Next
            </button>
          </div>
          <Show when={!loading()} fallback={<p>Loading timetable...</p>}>
            <Show when={!error()} fallback={<p class="text-red-500">{error()}</p>}>
              <div class="grid grid-cols-7 gap-2">
                <For each={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}>
                  {(dayName) => (
                    <div class="text-center font-semibold">{dayName}</div>
                  )}
                </For>
                <For each={getCalendarDays()}>
                  {(week) =>
                    week.map((day) => (
                      <div
                        class={`h-20 p-1 border border-gray-500 rounded-lg ${
                          day ? 'cursor-pointer' : ''
                        } ${
                          day &&
                          isSameDay(day, new Date()) &&
                          'bg-blue-700 text-white'
                        } ${
                          day && timetable()[format(day, 'yyyy-MM-dd')]?.exams.length
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-800'
                        } hover:bg-blue-600 transition duration-200 ease-in-out`}
                        onClick={() => day && handleDateClick(day)}
                      >
                        <Show when={day}>
                          <div class="flex flex-col h-full">
                            <div class="text-right">{format(day, 'd')}</div>
                            <div class="flex-grow overflow-hidden">
                              <For
                                each={
                                  timetable()[format(day, 'yyyy-MM-dd')]?.sessions ||
                                  []
                                }
                              >
                                {(session) => (
                                  <div class="text-xs bg-green-500 text-black rounded px-1 truncate">
                                    {session.subject}
                                  </div>
                                )}
                              </For>
                              <Show
                                when={
                                  timetable()[format(day, 'yyyy-MM-dd')]?.exams
                                    .length
                                }
                              >
                                <div class="text-xs bg-red-700 text-white rounded px-1 mt-1">
                                  Exam Day
                                </div>
                              </Show>
                            </div>
                          </div>
                        </Show>
                      </div>
                    ))
                  }
                </For>
              </div>
              <Show when={selectedDate()}>
                <div class="mt-6">
                  <h3 class="text-xl font-semibold mb-2">
                    Sessions on {format(selectedDate(), 'MMMM d, yyyy')}
                  </h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <For each={sessionsForSelectedDate()}>
                      {(session) => (
                        <div class="bg-gray-800 p-4 rounded-lg">
                          <p class="font-semibold">Time: {session.time}</p>
                          <p>Subject: {session.subject}</p>
                        </div>
                      )}
                    </For>
                    <Show when={sessionsForSelectedDate().length === 0}>
                      <p>No sessions scheduled for this day.</p>
                    </Show>
                  </div>
                </div>
              </Show>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
}

export default Timetable;
```