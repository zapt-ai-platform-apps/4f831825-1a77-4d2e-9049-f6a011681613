import React from 'react';

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
          <label className="font-semibold mb-1 md:mb-0 md:w-32">{block}</label>
          <div className="flex-1 flex space-x-2">
            <input
              type="time"
              value={blockTimes[block]?.startTime || ''}
              onChange={(e) => handleTimeChange(block, 'startTime', e.target.value)}
              className="input w-full text-black"
            />
            <span className="self-center">to</span>
            <input
              type="time"
              value={blockTimes[block]?.endTime || ''}
              onChange={(e) => handleTimeChange(block, 'endTime', e.target.value)}
              className="input w-full text-black"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default BlockTimeForm;