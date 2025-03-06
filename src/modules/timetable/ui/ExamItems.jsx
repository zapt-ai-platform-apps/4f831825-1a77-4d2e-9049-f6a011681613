import React from 'react';

/**
 * Component to display exam items in a calendar day
 * @param {Object} props - Component props
 * @param {Array} props.exams - Exams for this day
 * @returns {React.ReactElement} Exam items component
 */
function ExamItems({ exams }) {
  if (!exams) return null;

  // Sort exams by time of day: Morning, Afternoon, Evening
  const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
  exams.sort((a, b) => blockOrder[a.timeOfDay] - blockOrder[b.timeOfDay]);

  return (
    <div className="mb-2 px-1 space-y-1">
      {exams.map((exam) => (
        <div
          key={exam.id}
          className="p-1 rounded text-xs sm:text-sm cursor-pointer whitespace-nowrap overflow-hidden"
          style={{ backgroundColor: exam.examColour || 'red' }}
        >
          <div>
            <span className="font-semibold block">{exam.timeOfDay}</span>
            <span className="block">{exam.subject}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExamItems;