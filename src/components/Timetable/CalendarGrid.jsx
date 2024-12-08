import { For } from 'solid-js';
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import DayCell from './DayCell';

function CalendarGrid(props) {
  const daysInMonth = () => {
    const start = startOfMonth(props.currentMonth);
    const end = endOfMonth(props.currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const startDayOfWeek = () => {
    return getDay(startOfMonth(props.currentMonth));
  };

  return (
    <div class="w-full mx-auto overflow-x-auto">
      <div class="min-w-[700px]">
        <div class="grid grid-cols-7 gap-0">
          <For each={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}>
            {(day) => (
              <div class="text-center font-semibold">{day}</div>
            )}
          </For>
        </div>
        <div class="grid grid-cols-7 auto-rows-[minmax(80px,auto)] sm:auto-rows-[minmax(100px,auto)] gap-0">
          <For each={Array((startDayOfWeek() + 6) % 7)}>
            {() => (
              <div></div>
            )}
          </For>
          <For each={daysInMonth()}>
            {(day) => (
              <DayCell
                day={day}
                datesWithData={props.datesWithData}
                isSelected={props.selectedDate && isSameDay(day, props.selectedDate)}
                onDateClick={props.onDateClick}
                subjectColours={props.subjectColours}
              />
            )}
          </For>
        </div>
      </div>
    </div>
  );
}

export default CalendarGrid;