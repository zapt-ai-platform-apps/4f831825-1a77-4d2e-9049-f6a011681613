import { Show, For } from 'solid-js';

function SessionsList(props) {
  const getSubjectCode = (subject) => {
    return subject ? subject.substring(0, 4).toUpperCase() : '';
  };

  const getSessionTime = (session) => {
    return `${session.startTime.substring(0, 5)} - ${session.endTime.substring(0, 5)}`;
  };

  return (
    <>
      <Show when={props.sortedSessions().length > 0}>
        <div class="mt-5 flex flex-col gap-1 px-1 sm:hidden">
          <For each={props.sortedSessions()}>
            {(session) => (
              <div
                class="flex items-center justify-center h-4 text-[8px] font-bold text-white rounded cursor-pointer"
                style={{
                  'background-color': props.subjectColours()[session.subject],
                }}
              >
                {getSubjectCode(session.subject)}
              </div>
            )}
          </For>
        </div>
      </Show>
      <Show when={props.sortedSessions().length > 0}>
        <div class="hidden sm:block mt-5 px-1 overflow-y-auto max-h-[80px]">
          <For each={props.sortedSessions()}>
            {(session) => (
              <div
                class="mb-1 p-1 rounded text-white text-xs cursor-pointer"
                style={{
                  'background-color': props.subjectColours()[session.subject],
                }}
              >
                <div class="font-bold">{session.subject}</div>
                <div class="text-[10px]">
                  {session.block} ({getSessionTime(session)})
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </>
  );
}

export default SessionsList;