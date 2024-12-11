import { Show, createMemo, For } from 'solid-js';
import { format } from 'date-fns';
import { Icon } from 'solid-heroicons';
import { academicCap } from 'solid-heroicons/solid';
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
      <Show when={dataForDay().exams.length > 0}>
        <div class="absolute top-1 right-1">
          <Icon path={academicCap} class="w-3 h-3 sm:w-5 sm:h-5 text-red-600" />
        </div>
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
                    'background': 'linear-gradient(to right, #ff5f6d, #ffc371)',
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