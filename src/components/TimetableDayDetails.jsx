import { createSignal, onMount, For, Show } from 'solid-js';
import { supabase } from '../supabaseClient';
import { useParams, useNavigate } from '@solidjs/router';
import * as Sentry from '@sentry/browser';
import { format, parseISO } from 'date-fns';
import { useTimetable } from '../contexts/TimetableContext';

function TimetableDayDetails() {
  const { timetable, exams } = useTimetable();
  const params = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = createSignal([]);
  const [dayExams, setDayExams] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal(null);
  const dateKey = params.date; // e.g., '2023-10-03'

  onMount(() => {
    fetchDayDetails();
  });

  const fetchDayDetails = () => {
    setLoading(true);
    try {
      // Get day's sessions from timetable
      const dayData = timetable() ? timetable()[dateKey] : null;
      const daySessions = dayData ? dayData.sessions : [];
      // Sort sessions by time
      daySessions.sort((a, b) => {
        const [hourA, minuteA] = a.time.split(':').map(Number);
        const [hourB, minuteB] = b.time.split(':').map(Number);
        return hourA * 60 + minuteA - (hourB * 60 + minuteB);
      });
      setSessions(daySessions);

      // Get day's exams from exams data
      const examsData = exams();
      const filteredExams = examsData.filter((exam) => exam.examDate === dateKey);
      setDayExams(filteredExams);
    } catch (error) {
      console.error('Error fetching day details:', error);
      setError(error.message);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/timetable?date=${dateKey}`);
  };

  return (
    <div class="h-full flex flex-col text-white">
      <div class="flex-grow p-4">
        <div class="w-full max-w-4xl mx-auto">
          <button
            class="mb-4 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            onClick={handleBack}
          >
            Back to Timetable
          </button>
          <h2 class="text-2xl font-bold mb-4">
            Details for {format(parseISO(dateKey), 'MMMM d, yyyy')}
          </h2>
          <Show when={error()}>
            <p class="text-red-500">{error()}</p>
          </Show>
          <Show when={loading()}>
            <p>Loading...</p>
          </Show>
          <Show when={!loading() && !error()}>
            {/* Exams */}
            <Show when={dayExams().length > 0}>
              <h3 class="text-xl font-semibold mb-2">Exams:</h3>
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
            {/* Sessions */}
            <Show when={sessions().length > 0}>
              <h3 class="text-xl font-semibold mt-4 mb-2">Revision Sessions:</h3>
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
              <p>No exams or sessions scheduled for this day.</p>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
}

export default TimetableDayDetails;