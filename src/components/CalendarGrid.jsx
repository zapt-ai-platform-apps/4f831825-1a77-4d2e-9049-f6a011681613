import { For, Show } from 'solid-js';
import { format, isSameDay } from 'date-fns';

function CalendarGrid(props) {
  const weeks = props.getCalendarDays();

  return (
    <div class="grid grid-cols-7 gap-px">
      <For each={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}>
        {(dayName) => (
          <div class="text-center font-semibold">{dayName}</div>
        )}
      </For>
      <For each={weeks}>
        {(week) =>
          week.map((day) => {
            const dateKey = day ? format(day, 'yyyy-MM-dd') : null;
            const hasExam = dateKey && props.examsByDate()[dateKey];
            const hasSession = dateKey && props.timetable() && props.timetable()[dateKey] && props.timetable()[dateKey].sessions.length > 0;
            const isToday = day && isSameDay(day, new Date());
            const isSelected = dateKey && props.selectedDate() === dateKey;
            let bgClass = '';
            if (hasExam) {
              bgClass = 'bg-red-500 text-white';
            } else if (isToday) {
              bgClass = 'bg-blue-700 text-white';
            } else {
              bgClass = 'bg-transparent text-white';
            }

            if (isSelected) {
              bgClass = 'bg-yellow-500 text-black';
            }

            const subjectsForDay = day ? props.getSessionsSubjectsForDay(day) : [];

            return (
              <div
                class={`aspect-square ${
                  day ? 'cursor-pointer' : ''
                } ${bgClass} border border-white ${
                  day ? 'hover:bg-blue-600' : ''
                } rounded-lg transition duration-200 ease-in-out flex flex-col items-center justify-center`}
                onClick={() => props.handleDateClick(day)}
              >
                <Show when={day}>
                  <div>{format(day, 'd')}</div>
                  <div class="flex space-x-0.5 mt-1">
                    <For each={subjectsForDay}>
                      {(subject) => (
                        <div class="w-2 h-2 rounded-full" style={{ background: props.subjectColours()[subject] }}></div>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            );
          })
        }
      </For>
    </div>
  );
}

export default CalendarGrid;