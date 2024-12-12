import { Show, For } from 'solid-js';

function SessionsList(props) {
  const getSubjectCode = (subject) => {
    return subject ? subject.substring(0, 4).toUpperCase() : '';
  };

  const getSessionTime = (session) => {
    return `${session.startTime.substring(0, 5)} - ${session.endTime.substring(0, 5)}`;
  };

  const desiredOrder = ['Morning', 'Afternoon', 'Evening'];

  const sessionsByBlock = () => {
    const map = {};
    for (const session of props.sortedSessions()) {
      map[session.block] = session;
    }
    return map;
  };

  const sessionsToDisplay = () => {
    const map = sessionsByBlock();
    return desiredOrder.map((block) => map[block] || { block });
  };

  return (
    <>
      {/* Mobile view */}
      <div class="mt-5 flex flex-col gap-1 px-1 sm:hidden">
        <For each={sessionsToDisplay()}>
          {(session) => (
            <Show
              when={session.subject}
              fallback={<div class="flex-1 h-4"></div>}
            >
              <div
                class="flex items-center justify-center h-4 text-[8px] font-bold text-white rounded cursor-pointer"
                style={{
                  'background-color': props.subjectColours()[session.subject],
                }}
              >
                {getSubjectCode(session.subject)}
              </div>
            </Show>
          )}
        </For>
      </div>
      {/* Desktop view */}
      <div class="hidden sm:block mt-5 px-1">
        <For each={sessionsToDisplay()}>
          {(session) => (
            <Show
              when={session.subject}
              fallback={
                <div class="mb-1 p-1 rounded text-transparent text-xs cursor-default">
                  {/* Empty placeholder */}
                  <div class="font-bold">&nbsp;</div>
                  <div class="text-[10px]">&nbsp;</div>
                </div>
              }
            >
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
            </Show>
          )}
        </For>
      </div>
    </>
  );
}

export default SessionsList;