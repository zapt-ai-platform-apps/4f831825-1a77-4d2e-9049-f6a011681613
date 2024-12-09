import { Show, For } from 'solid-js';

function AvailableRevisionTimes(props) {
  const preferences = props.preferences;
  const setPreferences = props.setPreferences;

  const timeBlocks = ['Morning', 'Afternoon', 'Evening'];

  const handleBlockSelection = (day, block) => {
    const dayBlocks = preferences().revisionTimes[day] || [];
    const hasBlock = dayBlocks.includes(block);

    if (hasBlock) {
      setPreferences({
        ...preferences(),
        revisionTimes: {
          ...preferences().revisionTimes,
          [day]: dayBlocks.filter((b) => b !== block),
        },
      });
    } else {
      setPreferences({
        ...preferences(),
        revisionTimes: {
          ...preferences().revisionTimes,
          [day]: [...dayBlocks, block],
        },
      });
    }
  };

  return (
    <div>
      <h3 class="text-xl font-semibold mb-2 text-center">
        Available Revision Times
      </h3>
      <Show when={preferences().revisionTimes}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <For each={Object.keys(preferences().revisionTimes)}>
            {(day) => (
              <div>
                <h4 class="font-semibold mb-1 capitalize">{day}</h4>
                <div class="flex flex-wrap gap-2">
                  <For each={timeBlocks}>
                    {(block) => (
                      <button
                        class={`px-3 py-1 rounded-full cursor-pointer ${
                          preferences().revisionTimes[day].includes(block)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}
                        onClick={() => handleBlockSelection(day, block)}
                      >
                        {block}
                      </button>
                    )}
                  </For>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}

export default AvailableRevisionTimes;