import { For, Show } from 'solid-js';

function SessionSection(props) {
  const { sessions, subjectColours, onEditSession, onDeleteSession, loading } = props;

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const formatTime = (timeString) => {
    const [hour, minute] = timeString.split(':');
    return `${hour}:${minute}`;
  };

  return (
    <div>
      <h4 class="text-lg font-semibold mb-2">Revision Sessions</h4>
      <div class="space-y-4">
        <For each={sessions()}>
          {(session) => (
            <div
              class="p-4 rounded-lg border-l-4 relative"
              style={{
                'border-color': subjectColours()[session.subject],
                'background-color': '#f9f9f9',
              }}
            >
              <p class="font-semibold text-black flex items-center">
                <span
                  class="w-4 h-4 rounded-full mr-2"
                  style={{ 'background-color': subjectColours()[session.subject] }}
                ></span>
                Subject: {capitalizeFirstLetter(session.subject)}
              </p>
              <p class="text-black">Block: {session.block}</p>
              <p class="text-black">
                Time: {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </p>
              <Show when={session.isUserCreated}>
                <div class="absolute top-2 right-2 flex space-x-2">
                  <button
                    class="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                    onClick={() => onEditSession(session)}
                    disabled={loading()}
                  >
                    Edit
                  </button>
                  <button
                    class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                    onClick={() => onDeleteSession(session)}
                    disabled={loading()}
                  >
                    Delete
                  </button>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

export default SessionSection;