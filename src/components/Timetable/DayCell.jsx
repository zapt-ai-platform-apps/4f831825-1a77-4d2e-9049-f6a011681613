import { Show } from 'solid-js';
import { format, isSameDay } from 'date-fns';

function DayCell(props) {
  const dateKey = () => props.day.toISOString().split('T')[0];
  const dataForDay = () => props.datesWithData[dateKey()] || { sessions: [], exams: [] };
  const isToday = isSameDay(props.day, new Date());

  return (
    <div
      class={`border p-1 rounded-lg cursor-pointer ${
        isToday ? 'bg-blue-800' : 'bg-white text-black'
      } ${props.isSelected ? 'border-2 border-yellow-500' : ''}`}
      onClick={() => props.onDateClick(props.day)}
    >
      <div class="font-bold text-center">{format(props.day, 'd')}</div>
      <Show when={dataForDay().exams.length > 0}>
        <div class="text-xs text-red-600 font-semibold">Exam</div>
      </Show>
      <Show when={dataForDay().sessions.length > 0}>
        <div class="text-xs text-green-600 font-semibold">Revision</div>
      </Show>
    </div>
  );
}

export default DayCell;