import React from 'react';

/**
 * Form for setting block times
 * @param {Object} props - Component props
 * @param {Object} props.blockTimes - Block times object
 * @param {Function} props.onChange - Change handler
 * @returns {React.ReactElement} Block time form
 */
function BlockTimeForm({ blockTimes, onChange }) {
  const timeBlocks = ['Morning', 'Afternoon', 'Evening'];

  const handleTimeChange = (blockName, field, value) => {
    const updatedTimes = {
      ...blockTimes[blockName],
      [field]: value,
    };
    onChange(blockName, updatedTimes);
  };

  return (
    <div className="space-y-4">
      {timeBlocks.map((block) => (
        <div key={block} className="flex flex-col md:flex-row md:items-center md:space-x-4">
          <label className="font-semibold mb-1 md:mb-0 md:w-32 text-gray-700 dark:text-gray-300">{block}</label>
          <div className="flex-1 flex space-x-2">
            <input
              type="time"
              value={blockTimes[block]?.startTime || ''}
              onChange={(e) => handleTimeChange(block, 'startTime', e.target.value)}
              className="input w-full box-border border border-gray-300 dark:border-gray-600 rounded-md p-2"
            />
            <span className="self-center text-gray-600 dark:text-gray-400">to</span>
            <input
              type="time"
              value={blockTimes[block]?.endTime || ''}
              onChange={(e) => handleTimeChange(block, 'endTime', e.target.value)}
              className="input w-full box-border border border-gray-300 dark:border-gray-600 rounded-md p-2"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default BlockTimeForm;