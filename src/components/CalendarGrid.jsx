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
            const examsForDate = dateKey
              ? props.exams.filter((exam) => exam.examDate === dateKey)
              : [];
            const hasExam = examsForDate.length > 0;
            const sessionsForDay =
              dateKey && props.timetable()[dateKey] ? props.timetable()[dateKey] : [];
            const isToday = day && isSameDay(day, new Date());
            const isSelected = dateKey && props.selectedDate() === dateKey;
            let bgClass = '';

            if (isSelected) {
              bgClass = 'bg-yellow-500 text-black';
            } else if (isToday) {
              bgClass = 'bg-blue-700 text-white';
            } else {
              bgClass = 'bg-white text-black';
            }

            return (
              <div
                class={`aspect-square p-1 ${
                  day ? 'cursor-pointer' : ''
                } ${bgClass} border border-gray-300 ${
                  day ? 'hover:bg-blue-100' : ''
                } rounded-lg transition duration-200 ease-in-out flex flex-col items-start justify-start`}
                onClick={() => props.handleDateClick(day)}
              >
                <Show when={day}>
                  <div class="font-bold self-center">{format(day, 'd')}</div>
                  <Show when={hasExam}>
                    <div class="text-xs text-red-600 font-semibold mt-1">
                      Exam:
                      <For each={examsForDate}>
                        {(exam, index) => (
                          <>
                            {index() > 0 && ', '}
                            {exam.subject}
                          </>
                        )}
                      </For>
                    </div>
                  </Show>
                  <Show when={sessionsForDay.length > 0}>
                    <div class="mt-1">
                      <For each={sessionsForDay}>
                        {(session) => (
                          <div
                            class="text-xs mt-0.5 px-1 rounded bg-gray-200"
                            style={{
                              'background-color': props.subjectColours()[session.subject],
                              color: 'white',
                            }}
                          >
                            {session.subject}
                          </div>
                        )}
                      </For>
                    </div>
                  </Show>
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