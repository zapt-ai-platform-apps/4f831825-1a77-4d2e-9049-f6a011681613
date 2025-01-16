import React from 'react';

function AvailableRevisionTimes(props) {
  const { preferences, setPreferences } = props;
  const timeBlocks = ['Morning', 'Afternoon', 'Evening'];

  const handleBlockSelection = (day, block) => {
    const dayBlocks = preferences.revisionTimes[day] || [];
    const hasBlock = dayBlocks.includes(block);

    if (hasBlock) {
      setPreferences({
        ...preferences,
        revisionTimes: {
          ...preferences.revisionTimes,
          [day]: dayBlocks.filter((b) => b !== block),
        },
      });
    } else {
      setPreferences({
        ...preferences,
        revisionTimes: {
          ...preferences.revisionTimes,
          [day]: [...dayBlocks, block],
        },
      });
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 text-center">
        Available Revision Times
      </h3>
      {preferences.revisionTimes && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(preferences.revisionTimes).map((day) => (
            <div key={day}>
              <h4 className="font-semibold mb-1 capitalize">{day}</h4>
              <div className="flex flex-wrap gap-2">
                {timeBlocks.map((block) => (
                  <button
                    key={block}
                    className={`btn px-3 py-1 ${
                      preferences.revisionTimes[day].includes(block)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-input text-foreground'
                    }`}
                    onClick={() => handleBlockSelection(day, block)}
                  >
                    {block}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AvailableRevisionTimes;