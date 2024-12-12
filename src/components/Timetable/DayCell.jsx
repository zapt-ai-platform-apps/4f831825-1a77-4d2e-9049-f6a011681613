import { Show, createMemo, For } from 'solid-js';
import { format } from 'date-fns';
import SessionsList from './SessionsList';

function DayCell(props) {
  const dateKey = () => props.day.toISOString().split('T')[0];
  const dataForDay = () =>
    props.datesWithData()[dateKey()] || { sessions: [], exams: [] };

  const sortedSessions = createMemo(() => {
    const desiredOrder = ['Morning', 'Afternoon', 'Evening'];
    return [...dataForDay().sessions].sort((a, b) => {
      const blockAIndex = desiredOrder.indexOf(a.block);
      const blockBIndex = desiredOrder.indexOf(b.block);
      return blockAIndex - blockBIndex;
    });
  });

  return (
    <div
      class={`relative border border-white cursor-pointer hover:bg-gray-700 hover:bg-opacity-25 transition duration-200 ease-in-out ${
        props.isSelected() ? 'border-2 border-yellow-500' : ''
      } min-h-[60px] sm:min-h-[150px]`}
      onClick={() => props.onDateClick(props.day)}
    >
      <div class="absolute top-1 left-1 font-bold text-xs sm:text-base text-white">
        {format(props.day, 'd')}
      </div>
      {/* Indicator for exams on mobile screens */}
      <Show when={dataForDay().exams.length > 0}>
        <div class="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 sm:hidden"></div>
      </Show>
      <div class="mt-5 sm:mt-10">
        {/* Display exam details on desktop */}
        <Show when={dataForDay().exams.length > 0}>
          <div class="hidden sm:block mb-2 px-1">
            <For each={dataForDay().exams}>
              {(exam) => (
                <div
                  class="mb-1 p-2 rounded-lg text-white cursor-pointer"
                  style={{
                    'background-color': '#FF0000', // Bright red color for exams
                  }}
                >
                  <div class="font-bold text-base">Exam: {exam.subject}</div>
                  <div class="text-sm">Time of Day: {exam.timeOfDay || 'Morning'}</div>
                  <div class="text-sm">Board: {exam.board}</div>
                  <div class="text-sm">Teacher: {exam.teacher}</div>
                </div>
              )}
            </For>
          </div>
        </Show>
        <SessionsList
          sortedSessions={sortedSessions}
          subjectColours={props.subjectColours}
        />
      </div>
    </div>
  );
}

export default DayCell;