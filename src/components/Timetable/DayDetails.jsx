import { Show, createMemo } from 'solid-js';
import { format } from 'date-fns';
import ExamSection from './ExamSection';
import SessionSection from './SessionSection';

function DayDetails(props) {
  const dateKey = () => props.date.toISOString().split('T')[0];
  const dataForDay = () => props.datesWithData[dateKey()] || { sessions: [], exams: [] };

  const sortedSessions = createMemo(() => {
    const sessions = dataForDay().sessions || [];
    const desiredOrder = ['Morning', 'Afternoon', 'Evening'];
    return sessions.slice().sort((a, b) => {
      return desiredOrder.indexOf(a.block) - desiredOrder.indexOf(b.block);
    });
  });

  return (
    <div class="bg-white text-black p-4 rounded-lg shadow-lg mt-4">
      <h3 class="text-xl font-bold mb-4 text-center">
        Details for {format(props.date, 'MMMM d, yyyy')}
      </h3>
      <div class="space-y-6">
        <Show when={dataForDay().exams.length > 0}>
          <ExamSection exams={() => dataForDay().exams} />
        </Show>
        <Show when={sortedSessions().length > 0}>
          <SessionSection sessions={sortedSessions} subjectColours={props.subjectColours} />
        </Show>
        <Show when={dataForDay().exams.length === 0 && sortedSessions().length === 0}>
          <p class="text-center">No events for this day.</p>
        </Show>
      </div>
    </div>
  );
}

export default DayDetails;