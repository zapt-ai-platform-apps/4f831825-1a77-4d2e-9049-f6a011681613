import { For, Show, createMemo } from 'solid-js';
import { format, isSameDay } from 'date-fns';

function CalendarGrid(props) {
  const weeks = props.getCalendarDays();

  function DayCell(props) {
    const dateKey = createMemo(() => props.day ? format(props.day, 'yyyy-MM-dd') : null);
    const hasExam = createMemo(() => dateKey() && props.examsByDate()[dateKey()]);
    const hasSession = createMemo(() => dateKey() && props.timetable()[dateKey()] && props.timetable()[dateKey()].sessions.length > 0);
    const isToday = createMemo(() => props.day && isSameDay(props.day, new Date()));
    const isSelected = createMemo(() => dateKey() && props.selectedDate() === dateKey());

    const bgClass = createMemo(() => {
      if (isSelected()) {
        return 'bg-yellow-500 text-black';
      } else if (hasExam()) {
        return 'bg-red-500 text-white';
      } else if (isToday()) {
        return 'bg-blue-700 text-white';
      } else {
        return 'bg-transparent text-white';
      }
    });

    const subjectsForDay = createMemo(() => props.day ? props.getSessionsSubjectsForDay(props.day) : []);

    return (
      <div
        class={`aspect-square ${
          props.day ? 'cursor-pointer' : ''
        } ${bgClass()} border border-white ${
          props.day ? 'hover:bg-blue-600' : ''
        } rounded-lg transition duration-200 ease-in-out flex flex-col items-center justify-center`}
        onClick={() => props.handleDateClick(props.day)}
      >
        <Show when={props.day}>
          <div>{format(props.day, 'd')}</div>
          <div class="flex space-x-0.5 mt-1">
            <For each={subjectsForDay()}>
              {(subject) => (
                <div class="w-2 h-2 rounded-full" style={{ background: props.subjectColours()[subject] }}></div>
              )}
            </For>
          </div>
        </Show>
      </div>
    );
  }

  return (
    <div class="grid grid-cols-7 gap-px">
      <For each={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}>
        {(dayName) => (
          <div class="text-center font-semibold">{dayName}</div>
        )}
      </For>
      <For each={weeks}>
        {(week) =>
          week.map((day) => (
            <DayCell
              day={day}
              selectedDate={props.selectedDate}
              handleDateClick={props.handleDateClick}
              timetable={props.timetable}
              examsByDate={props.examsByDate}
              getSessionsSubjectsForDay={props.getSessionsSubjectsForDay}
              subjectColours={props.subjectColours}
            />
          ))
        }
      </For>
    </div>
  );
}

export default CalendarGrid;