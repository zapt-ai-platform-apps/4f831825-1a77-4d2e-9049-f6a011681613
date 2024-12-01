import { Show, For } from 'solid-js';
import { format, isSameDay } from 'date-fns';

function DayCell(props) {
  const dateKey = () => props.day.toISOString().split('T')[0];
  const dataForDay = () => props.datesWithData[dateKey()] || { sessions: [], exams: [] };
  const isToday = isSameDay(props.day, new Date());

  const sessionSubjects = () => {
    const subjects = dataForDay().sessions.map((session) => session.subject);
    return Array.from(new Set(subjects));
  };

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
      <Show when={sessionSubjects().length > 0}>
        <div class="flex flex-wrap justify-center mt-1">
          <For each={sessionSubjects()}>
            {(subject) => (
              <div
                class="w-2 h-2 rounded-full m-0.5"
                style={{ "background-color": props.subjectColours[subject] }}
              ></div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

export default DayCell;