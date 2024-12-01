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
                  <div class="bg-red-100 p-4 rounded-lg">
                    <p class="font-semibold text-red-600">{exam.subject}</p>
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
                  <div class="bg-green-100 p-4 rounded-lg">
                    <p class="font-semibold text-green-600">Subject: {session.subject}</p>
                    <p>Block: {session.block}</p>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
        <Show
          when={
            dataForDay().exams.length === 0 && sortedSessions().length === 0
          }
        >
          <p class="text-center">No events for this day.</p>
        </Show>
      </div>
    </div>
  );
}

export default DayDetails;