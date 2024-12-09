import { Show, For } from 'solid-js';
import { format } from 'date-fns';
import { Icon } from 'solid-heroicons';
import { academicCap } from 'solid-heroicons/solid';

function DayCell(props) {
  const dateKey = () => props.day.toISOString().split('T')[0];
  const dataForDay = () => props.datesWithData[dateKey()] || { sessions: [], exams: [] };

  return (
    <div
      class={`relative border border-white cursor-pointer hover:bg-gray-700 hover:bg-opacity-25 transition duration-200 ease-in-out ${
        props.isSelected ? 'border-2 border-yellow-500' : ''
      }`}
      onClick={() => props.onDateClick(props.day)}
    >
      <div class="absolute top-1 left-1 font-bold text-white">{format(props.day, 'd')}</div>
      <Show when={dataForDay().exams.length > 0}>
        <div class="absolute top-1 right-1">
          <Icon path={academicCap} class="w-4 h-4 text-red-600" />
        </div>
      </Show>
      <Show when={dataForDay().sessions.length > 0}>
        <div class="absolute inset-0 flex flex-wrap items-center justify-center">
          <For each={dataForDay().sessions}>
            {(session) => (
              <div
                class="w-2 h-2 rounded-full m-0.5"
                style={{
                  'background-color': props.subjectColours[session.subject],
                }}
              ></div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

export default DayCell;