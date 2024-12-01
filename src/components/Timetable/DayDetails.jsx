import { Show, For } from 'solid-js';
import { format } from 'date-fns';

function DayDetails(props) {
  const dateKey = props.date.toISOString().split('T')[0];
  const dataForDay = props.datesWithData[dateKey] || { sessions: [], exams: [] };

  return (
    <div class="bg-white text-black p-4 rounded-lg">
      <h3 class="text-xl font-bold mb-2">Details for {format(props.date, 'MMMM d, yyyy')}</h3>
      <div>
        <Show when={dataForDay.exams.length > 0}>
          <h4 class="font-semibold">Exams:</h4>
          <For each={dataForDay.exams}>
            {(exam) => (
              <div class="mb-2">
                <p>{exam.subject}</p>
                <p>Board: {exam.board}</p>
                <p>Teacher: {exam.teacher}</p>
              </div>
            )}
          </For>
        </Show>
        <Show when={dataForDay.sessions.length > 0}>
          <h4 class="font-semibold">Revision Sessions:</h4>
          <For each={dataForDay.sessions}>
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
            dataForDay.exams.length === 0 && dataForDay.sessions.length === 0
          }
        >
          <p>No events for this day.</p>
        </Show>
      </div>
    </div>
  );
}

export default DayDetails;