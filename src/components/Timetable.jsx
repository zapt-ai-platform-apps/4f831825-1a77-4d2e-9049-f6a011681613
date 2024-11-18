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
import { Icon } from 'solid-heroicons';
import { chevronLeft, chevronRight } from 'solid-heroicons/solid';
import { useNavigate, useSearchParams } from '@solidjs/router';

function Timetable() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [timetable, setTimetable] = createSignal({});
  const [exams, setExams] = createSignal([]);
  const [examsByDate, setExamsByDate] = createSignal({});
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal(null);
  const [currentMonth, setCurrentMonth] = createSignal(new Date());

  const fetchSavedTimetable = async () => {
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

  const fetchExams = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
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
          // Process exams data into examsByDate
          const examsByDateMap = {};
          data.forEach((exam) => {
            const examDate = exam.examDate; // Assuming examDate is in 'YYYY-MM-DD' format
            if (!examsByDateMap[examDate]) {
              examsByDateMap[examDate] = [];
            }
            examsByDateMap[examDate].push(exam);
          });
          setExamsByDate(examsByDateMap);
        }
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error fetching exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      Sentry.captureException(error);
    }
  };

  const getCalendarDays = () => {
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
  };

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
    }
    fetchSavedTimetable();
    fetchExams();
  });

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
                          const isToday = day && isSameDay(day, new Date());
                          const isSelectedDay = false; // No longer needed
                          let bgClass = '';
                          if (hasExam) {
                            bgClass = 'bg-red-500 text-white';
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