import { For } from 'solid-js';

function SessionSection(props) {
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
        <For each={props.sessions()}>
          {(session) => (
            <div
              class="p-4 rounded-lg border-l-4"
              style={{
                'border-color': props.subjectColours[session.subject],
                'background-color': '#f9f9f9',
              }}
            >
              <p class="font-semibold text-black flex items-center">
                <span
                  class="w-4 h-4 rounded-full mr-2"
                  style={{ 'background-color': props.subjectColours[session.subject] }}
                ></span>
                Subject: {capitalizeFirstLetter(session.subject)}
              </p>
              <p class="text-black">Block: {session.block}</p>
              <p class="text-black">
                Time: {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </p>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

export default SessionSection;