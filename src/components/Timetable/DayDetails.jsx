import { Show, For, createMemo } from 'solid-js';
import { format } from 'date-fns';

function DayDetails(props) {
  const dateKey = () => props.date.toISOString().split('T')[0];
  const dataForDay = () => props.datesWithData[dateKey()] || { sessions: [], exams: [] };

  const sortedSessions = createMemo(() => {
    const sessions = dataForDay().sessions || [];
    const desiredOrder = ['Morning', 'Afternoon', 'Evening'];
    return sessions.slice().sort((a, b) => {
      return desiredOrder.indexOf(a.block) - desiredOrder.indexOf(b.block);
    });
  });

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div class="bg-white text-black p-4 rounded-lg shadow-lg mt-4">
      <h3 class="text-xl font-bold mb-4 text-center">Details for {format(props.date, 'MMMM d, yyyy')}</h3>
      <div class="space-y-6">
        <Show when={dataForDay().exams.length > 0}>
          <div>
            <h4 class="text-lg font-semibold mb-2">Exams</h4>
            <div class="space-y-4">
              <For each={dataForDay().exams}>
                {(exam) => (
                  <div
                    class="p-4 rounded-lg text-white"
                    style={{
                      background: 'linear-gradient(to right, #ff7e5f, #feb47b)',
                    }}
                  >
                    <p class="font-semibold text-2xl">
                      Exam: {capitalizeFirstLetter(exam.subject)}
                    </p>
                    <p>Time of Day: {exam.timeOfDay || 'Morning'}</p>
                    <p>Board: {exam.board}</p>
                    <p>Teacher: {exam.teacher}</p>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
        <Show when={sortedSessions().length > 0}>
          <div>
            <h4 class="text-lg font-semibold mb-2">Revision Sessions</h4>
            <div class="space-y-4">
              <For each={sortedSessions()}>
                {(session) => (
                  <div
                    class="p-4 rounded-lg border-l-4"
                    style={{
                      'border-color': props.subjectColours[session.subject],
                      'background-color': '#f9f9f9',
                    }}
                  >
                    <p class="font-semibold text-black flex items-center">
                      <span
                        class="w-4 h-4 rounded-full mr-2"
                        style={{ 'background-color': props.subjectColours[session.subject] }}
                      ></span>
                      Subject: {capitalizeFirstLetter(session.subject)}
                    </p>
                    <p class="text-black">Block: {session.block}</p>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
        <Show when={dataForDay().exams.length === 0 && sortedSessions().length === 0}>
          <p class="text-center">No events for this day.</p>
        </Show>
      </div>
    </div>
  );
}

export default DayDetails;