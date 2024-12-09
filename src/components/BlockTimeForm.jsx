import { For } from 'solid-js';

function BlockTimeForm(props) {
  const timeBlocks = ['Morning', 'Afternoon', 'Evening'];

  const handleTimeChange = (blockName, field, value) => {
    const times = {
      ...props.blockTimes[blockName],
      [field]: value,
    };
    props.onChange(blockName, times);
  };

  return (
    <div class="space-y-4">
      <For each={timeBlocks}>
        {(block) => (
          <div class="flex flex-col md:flex-row md:items-center md:space-x-4">
            <label class="font-semibold mb-1 md:mb-0 md:w-32">{block}</label>
            <div class="flex-1 flex space-x-2">
              <input
                type="time"
                value={props.blockTimes[block]?.startTime || ''}
                onInput={(e) => handleTimeChange(block, 'startTime', e.target.value)}
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-black box-border cursor-pointer"
              />
              <span class="self-center">to</span>
              <input
                type="time"
                value={props.blockTimes[block]?.endTime || ''}
                onInput={(e) => handleTimeChange(block, 'endTime', e.target.value)}
                class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-black box-border cursor-pointer"
              />
            </div>
          </div>
        )}
      </For>
    </div>
  );
}

export default BlockTimeForm;