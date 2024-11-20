import { createSignal, onMount, For, Show, createMemo, createEffect } from 'solid-js';
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
import { Icon } from 'solid-heroicons';
import { chevronLeft, chevronRight } from 'solid-heroicons/solid';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { useTimetable } from '../contexts/TimetableContext';

function Timetable() {
  const { timetable, setTimetable, exams, preferences } = useTimetable();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const [currentMonth, setCurrentMonth] = createSignal(new Date());
  const [initialMonthSet, setInitialMonthSet] = createSignal(false);

  const examsByDate = createMemo(() => {
    const examsData = exams();
    const examsByDateMap = {};
    examsData.forEach((exam) => {
      const examDate = exam.examDate; // Assuming examDate is in 'YYYY-MM-DD' format
      if (!examsByDateMap[examDate]) {
        examsByDateMap[examDate] = [];
      }
      examsByDateMap[examDate].push(exam);
    });
    return examsByDateMap;
  });

  const getCalendarDays = createMemo(() => {
    const startDate = startOfMonth(currentMonth());
    const endDate = endOfMonth(currentMonth());
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
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth(), 1));
  };

  const handleDateClick = (day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    navigate(`/timetable/${dateKey}`);
  };

  onMount(() => {
    const dateParam = searchParams.date;
    if (dateParam) {
      const date = parseISO(dateParam);
      setCurrentMonth(startOfMonth(date));
      setInitialMonthSet(true);
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
      if (!isNaN(startDate)) {
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
          const timetableData = {};
          data.forEach((day) => {
            timetableData[day.date] = day;
          });
          setTimetable(timetableData);
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

      // Call /api/generateTimetable
      const generateResponse = await fetch('/api/generateTimetable', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        }
      });
      if (generateResponse.ok) {
        // Successfully generated timetable, now fetch it
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
          {/* Month and Year */}
          <div class="mb-2">
            <h3 class="text-xl font-semibold text-center">{format(currentMonth(), 'MMMM yyyy')}</h3>
          </div>
          <p class="text-center mb-4">Please select a day on the timetable to view its details.</p>
          {/* Calendar Container */}
          <div class="w-full flex justify-center">
            <div class="w-full sm:w-96 md:w-[32rem] lg:w-[36rem]">
              {/* Calendar Grid */}
              <Show when={!loading()} fallback={<p>Loading timetable...</p>}>
                <Show when={!error()} fallback={<p class="text-red-500">{error()}</p>}>
                  <div class="grid grid-cols-7 gap-1">
                    {/* Day Names */}
                    <For each={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}>
                      {(dayName) => (
                        <div class="text-center font-semibold">{dayName}</div>
                      )}
                    </For>
                    {/* Calendar Days */}
                    <For each={getCalendarDays()}>
                      {(week) =>
                        week.map((day) => {
                          const dateKey = day ? format(day, 'yyyy-MM-dd') : null;
                          const hasExam = dateKey && examsByDate()[dateKey];
                          const hasSession = dateKey && timetable()[dateKey] && timetable()[dateKey].sessions.length > 0;
                          const isToday = day && isSameDay(day, new Date());
                          let bgClass = '';
                          if (hasExam) {
                            bgClass = 'bg-red-500 text-white';
                          } else if (hasSession) {
                            bgClass = 'bg-green-500 text-white';
                          } else if (isToday) {
                            bgClass = 'bg-blue-700 text-white';
                          } else {
                            bgClass = 'bg-transparent text-white';
                          }

                          return (
                            <div
                              class={`aspect-square ${
                                day ? 'cursor-pointer' : ''
                              } ${bgClass} border border-white ${
                                day ? 'hover:bg-blue-600' : ''
                              } rounded-lg transition duration-200 ease-in-out flex items-center justify-center`}
                              onClick={() => day && handleDateClick(day)}
                            >
                              <Show when={day}>
                                <div>{format(day, 'd')}</div>
                              </Show>
                            </div>
                          );
                        })
                      }
                    </For>
                  </div>
                </Show>
              </Show>
            </div>
          </div>
          {/* Navigation Buttons */}
          <div class="flex items-center justify-between mt-4 w-full sm:w-96 md:w-[32rem] lg:w-[36rem] mx-auto">
            <button
              class="flex items-center px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handlePrevMonth}
            >
              <Icon path={chevronLeft} class="w-6 h-6 inline-block" />
              <span class="ml-1">Previous</span>
            </button>
            <button
              class="flex items-center px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleNextMonth}
            >
              <span class="mr-1">Next</span>
              <Icon path={chevronRight} class="w-6 h-6 inline-block" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timetable;