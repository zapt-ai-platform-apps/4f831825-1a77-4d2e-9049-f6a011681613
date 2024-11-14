import { createSignal, onMount, For, Show } from 'solid-js';
import { supabase } from '../supabaseClient';

function Timetable() {
  const [timetable, setTimetable] = createSignal([]);
  const [loading, setLoading] = createSignal(false);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      // Fetch preferences
      let preferencesData = null;
      let response = await fetch('/api/getPreferences', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        preferencesData = data;
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error fetching preferences');
      }

      // Fetch exams
      let examsData = null;
      response = await fetch('/api/getExams', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        examsData = data;
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error fetching exams');
      }

      // Generate timetable logic
      const generatedTimetable = generateTimetable(preferencesData, examsData);
      setTimetable(generatedTimetable);
    } catch (error) {
      console.error('Error generating timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimetable = (preferences, exams) => {
    const startDate = new Date(preferences.startDate);
    const endDate = new Date(
      exams.reduce((latest, exam) => (new Date(exam.examDate) > new Date(latest) ? exam.examDate : latest), exams[0].examDate)
    );
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const timetable = [];

    for (let i = 0; i <= days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySlots = preferences.revisionTimes[dayName];
      const dateString = currentDate.toISOString().split('T')[0];

      // Skip if no available times
      if (!daySlots.length) continue;

      // Check for exams on this date
      const examsToday = exams.filter((exam) => exam.examDate === dateString);

      // Skip revision on exam days
      if (examsToday.length) {
        timetable.push({
          date: dateString,
          sessions: [],
          exams: examsToday.map((exam) => exam.subject),
        });
        continue;
      }

      // Allocate revision sessions
      const sessions = [];
      const subjects = exams.map((exam) => exam.subject);

      // Evenly distribute subjects
      let subjectIndex = 0;
      daySlots.forEach((slot) => {
        const subject = subjects[subjectIndex % subjects.length];
        sessions.push({
          time: slot,
          subject,
        });
        subjectIndex++;
      });

      timetable.push({
        date: dateString,
        sessions,
        exams: [],
      });
    }

    return timetable;
  };

  onMount(fetchTimetable);

  return (
    <div class="max-w-6xl mx-auto">
      <h2 class="text-2xl font-bold mb-4">Your Revision Timetable</h2>
      <Show when={!loading()} fallback={<p>Generating timetable...</p>}>
        <For each={timetable()}>
          {(day) => (
            <div class="mb-6">
              <h3 class="text-xl font-semibold mb-2">{day.date}</h3>
              <Show when={day.exams.length}>
                <p class="text-red-500">Exam Day: {day.exams.join(', ')}</p>
              </Show>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <For each={day.sessions}>
                  {(session) => (
                    <div class="bg-gray-800 p-4 rounded-lg">
                      <p class="font-semibold">{session.time}</p>
                      <p>Subject: {session.subject}</p>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </Show>
    </div>
  );
}

export default Timetable;