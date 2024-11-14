import { createSignal, onMount, For, Show } from 'solid-js';
import { supabase } from '../supabaseClient';

function Timetable() {
  const [timetable, setTimetable] = createSignal([]);
  const [loading, setLoading] = createSignal(false);
  const [timeSlots, setTimeSlots] = createSignal([]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: prefs } = await supabase
        .from('preferences')
        .select('data')
        .eq('user_id', user.id)
        .single();

      const { data: exams } = await supabase
        .from('exams')
        .select('*')
        .eq('user_id', user.id)
        .gte('exam_date', new Date().toISOString().split('T')[0])
        .order('exam_date', { ascending: true });

      // Generate timetable logic
      const generatedTimetable = generateTimetable(prefs.data, exams);
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
      exams.reduce((latest, exam) => (new Date(exam.exam_date) > new Date(latest) ? exam.exam_date : latest), exams[0].exam_date)
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
      const examsToday = exams.filter((exam) => exam.exam_date === dateString);

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