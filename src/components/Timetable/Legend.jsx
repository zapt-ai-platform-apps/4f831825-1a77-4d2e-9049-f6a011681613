import { For } from 'solid-js';

function Legend(props) {
  const subjects = Object.keys(props.subjectColours);

  return (
    <div class="mt-4">
      <h4 class="text-lg font-semibold mb-2">Legend</h4>
      <div class="flex flex-wrap">
        <For each={subjects}>
          {(subject) => (
            <div class="flex items-center mr-4 mb-2">
              <div
                class="w-4 h-4 rounded-full mr-2"
                style={{ "background-color": props.subjectColours[subject] }}
              ></div>
              <span>{subject}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

export default Legend;