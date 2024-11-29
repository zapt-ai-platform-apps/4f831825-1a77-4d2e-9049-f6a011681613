import { For, Show } from 'solid-js';
import { format, parseISO } from 'date-fns';

function DayDetails(props) {
  return (
    <Show when={props.selectedDate()}>
      <div class="mt-8">
        <h3 class="text-xl font-bold mb-4 text-center">
          Details for {format(parseISO(props.selectedDate()), 'MMMM d, yyyy')}
        </h3>
        <Show when={props.dayExams().length > 0}>
          <h4 class="text-lg font-semibold mb-2">Exams:</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={props.dayExams()}>
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
        <Show when={props.sessions().length > 0}>
          <h4 class="text-lg font-semibold mt-4 mb-2">Revision Sessions:</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <For each={props.sessions()}>
              {(session) => (
                <div
                  class="p-4 rounded-lg"
                  style={{ 
                    background: props.subjectColours()[session.subject], 
                    color: 'white' 
                  }}
                >
                  <p class="font-semibold">Block: {session.block}</p>
                  <p>Subject: {session.subject}</p>
                </div>
              )}
            </For>
          </div>
        </Show>
        <Show when={props.dayExams().length === 0 && props.sessions().length === 0}>
          <p class="text-center">No exams or sessions scheduled for this day.</p>
        </Show>
      </div>
    </Show>
  );
}

export default DayDetails;