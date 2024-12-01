import { Show, For } from 'solid-js';
import { format, isSameDay } from 'date-fns';
import { Icon } from 'solid-heroicons';
import { academicCap } from 'solid-heroicons/solid';

function DayCell(props) {
  const dateKey = () => props.day.toISOString().split('T')[0];
  const dataForDay = () => props.datesWithData[dateKey()] || { sessions: [], exams: [] };
  const isToday = isSameDay(props.day, new Date());

  const getGridPositionClassString = (block) => {
    switch (block) {
      case 'Morning':
        return 'row-start-1 col-start-1 sm:row-start-1 sm:col-start-1';
      case 'Afternoon':
        return 'row-start-2 col-start-1 sm:row-start-1 sm:col-start-2';
      case 'Evening':
        return 'row-start-3 col-start-1 sm:row-start-1 sm:col-start-3';
      default:
        return '';
    }
  };

  return (
    <div
      class={`relative border p-1 rounded-lg cursor-pointer ${
        isToday ? 'bg-blue-800' : 'bg-white text-black'
      } ${props.isSelected ? 'border-2 border-yellow-500' : ''}`}
      onClick={() => props.onDateClick(props.day)}
    >
      <div class="font-bold text-center">{format(props.day, 'd')}</div>
      <Show when={dataForDay().exams.length > 0}>
        <div class="flex justify-center">
          <Icon path={academicCap} class="w-4 h-4 text-red-600" />
        </div>
      </Show>
      <Show when={dataForDay().sessions.length > 0}>
        <div class="absolute inset-0 grid grid-rows-3 grid-cols-1 sm:grid-rows-1 sm:grid-cols-3">
          <For each={dataForDay().sessions}>
            {(session) => (
              <div
                class={`w-2 h-2 rounded-full m-0.5 ${getGridPositionClassString(session.block)}`}
                style={{
                  "background-color": props.subjectColours[session.subject],
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