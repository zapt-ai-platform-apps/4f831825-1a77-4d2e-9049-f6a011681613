import React from 'react';

/**
 * Component for selecting available revision times
 * @param {Object} props - Component props
 * @param {Object} props.revisionTimes - Revision times object
 * @param {Function} props.onBlockSelection - Block selection handler
 * @returns {React.ReactElement} Revision times selector
 */
function RevisionTimesSelector({ revisionTimes, onBlockSelection }) {
  const timeBlocks = ['Morning', 'Afternoon', 'Evening'];

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 text-center">
        Available Revision Times
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(revisionTimes).map((day) => (
          <div key={day}>
            <h4 className="font-semibold mb-1 capitalize">{day}</h4>
            <div className="flex flex-wrap gap-2">
              {timeBlocks.map((block) => (
                <button
                  key={block}
                  className={`btn px-3 py-1 cursor-pointer ${
                    revisionTimes[day].includes(block)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-input text-foreground'
                  }`}
                  onClick={() => onBlockSelection(day, block)}
                >
                  {block}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RevisionTimesSelector;