import { Show } from 'solid-js';
import { format } from 'date-fns';
import ExamSection from './ExamSection';
import SessionSection from './SessionSection';
import SessionForm from '../SessionForm';

function DayDetailsContent(props) {
  return (
    <div class="bg-white text-black p-4 rounded-lg shadow-lg mt-4">
      <h3 class="text-xl font-bold mb-4 text-center">
        Details for {format(props.date, 'MMMM d, yyyy')}
      </h3>
      <div class="space-y-6">
        <Show when={props.dataForDay().exams.length > 0}>
          <ExamSection exams={() => props.dataForDay().exams} />
        </Show>
        <Show when={props.sortedSessions().length > 0}>
          <SessionSection
            sessions={props.sortedSessions}
            subjectColours={props.subjectColours}
            onEditSession={props.handleEditSession}
            onDeleteSession={props.handleDeleteSession}
            loading={props.loading}
          />
        </Show>
        <SessionForm
          date={props.date.toISOString().split('T')[0]}
          onSessionSaved={props.handleSessionSaved}
          editSession={props.editSession()}
          onCancelEdit={() => props.setEditSession(null)}
        />
        <Show
          when={
            props.dataForDay().exams.length === 0 &&
            props.sortedSessions().length === 0
          }
        >
          <p class="text-center">No events for this day.</p>
        </Show>
      </div>
    </div>
  );
}

export default DayDetailsContent;