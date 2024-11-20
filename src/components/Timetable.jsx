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
import { useSearchParams } from '@solidjs/router';
import { useTimetable } from '../contexts/TimetableContext';

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
    examsData.forEach((exam) => {
      const examDate = exam.examDate;
      if (!examsByDateMap[examDate]) {
        examsByDateMap[examDate] = [];
      }
      examsByDateMap[examDate].push(exam);
    });
    return examsByDateMap;
  });

  const orderedSubjects = createMemo(() => {
    if (exams()) {
      return exams().map((exam) => exam.subject);
    }
    return [];
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
      const daySessions = [...timetable()[dateKey].sessions];
      daySessions.sort((a, b) => {
        const [hourA, minuteA] = a.time.split(':').map(Number);
        const [hourB, minuteB] = b.time.split(':').map(Number);
        return hourA * 60 + minuteA - (hourB * 60 + minuteB);
      });
      return daySessions;
    }
    return [];
  });

  const dayExams = createMemo(() => {
    const dateKey = selectedDate();
    if (dateKey && exams()) {
      return exams().filter((exam) => exam.examDate === dateKey);
    }
    return [];
  });

  createEffect(() => {
    if (exams()) {
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

  const getSessionsSubjectsForDay = (day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const subjectsSet = new Set();
    if (timetable() && timetable()[dateKey]) {
      const sessions = timetable()[dateKey].sessions;
      sessions.forEach((session) => {
        subjectsSet.add(session.subject);
      });
    }
    const subjectsArray = Array.from(subjectsSet);
    const orderedSubjectsArray = orderedSubjects().filter((subject) => subjectsArray.includes(subject));
    return orderedSubjectsArray;
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
              <Show when={!loading()} fallback={<p>Loading timetable...</p>}>
                <Show when={!error()} fallback={<p class="text-red-500">{error()}</p>}>
                  <div class="grid grid-cols-7 gap-px">
                    <For each={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}>
                      {(dayName) => (
                        <div class="text-center font-semibold">{dayName}</div>
                      )}
                    </For>
                    <For each={getCalendarDays()}>
                      {(week) =>
                        week.map((day) => {
                          const dateKey = day ? format(day, 'yyyy-MM-dd') : null;
                          const hasExam = dateKey && examsByDate()[dateKey];
                          const hasSession = dateKey && timetable()[dateKey] && timetable()[dateKey].sessions.length > 0;
                          const isToday = day && isSameDay(day, new Date());
                          const isSelected = dateKey && selectedDate() === dateKey;
                          let bgClass = '';
                          if (hasExam) {
                            bgClass = 'bg-red-500 text-white';
                          } else if (isToday) {
                            bgClass = 'bg-blue-700 text-white';
                          } else {
                            bgClass = 'bg-transparent text-white';
                          }

                          if (isSelected) {
                            bgClass = 'bg-yellow-500 text-black';
                          }

                          const subjectsForDay = day ? getSessionsSubjectsForDay(day) : [];

                          return (
                            <div
                              class={`aspect-square ${
                                day ? 'cursor-pointer' : ''
                              } ${bgClass} border border-white ${
                                day ? 'hover:bg-blue-600' : ''
                              } rounded-lg transition duration-200 ease-in-out flex flex-col items-center justify-center`}
                              onClick={() => handleDateClick(day)}
                            >
                              <Show when={day}>
                                <div>{format(day, 'd')}</div>
                                <div class="flex space-x-0.5 mt-1">
                                  <For each={subjectsForDay}>
                                    {(subject) => (
                                      <div class="w-2 h-2 rounded-full" style={{ background: subjectColours()[subject] }}></div>
                                    )}
                                  </For>
                                </div>
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
          <Show when={selectedDate()}>
            <div class="mt-8">
              <h3 class="text-xl font-bold mb-4 text-center">
                Details for {format(parseISO(selectedDate()), 'MMMM d, yyyy')}
              </h3>
              <Show when={dayExams().length > 0}>
                <h4 class="text-lg font-semibold mb-2">Exams:</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <For each={dayExams()}>
                    {(exam) => (
                      <div class="bg-red-600 p-4 rounded-lg">
                        <p class="font-semibold">Subject: {exam.subject}</p>
                        <p>Board: {exam.board}</p>
                        <p>Teacher: {exam.teacher}</p>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
              <Show when={sessions().length > 0}>
                <h4 class="text-lg font-semibold mt-4 mb-2">Revision Sessions:</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <For each={sessions()}>
                    {(session) => (
                      <div class="bg-gray-800 p-4 rounded-lg">
                        <p class="font-semibold">Time: {session.time}</p>
                        <p>Subject: {session.subject}</p>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
              <Show when={dayExams().length === 0 && sessions().length === 0}>
                <p class="text-center">No exams or sessions scheduled for this day.</p>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}

export default Timetable;