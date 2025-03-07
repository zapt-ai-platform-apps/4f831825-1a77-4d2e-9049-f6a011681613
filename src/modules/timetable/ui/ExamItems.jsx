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
    <div className="mb-1 space-y-1">
      {exams.map((exam) => (
        <div
          key={exam.id}
          className="p-1 rounded text-[10px] xs:text-xs sm:text-sm cursor-pointer font-bold border border-red-700 shadow-md"
          style={{ backgroundColor: '#ff0000', color: 'white' }}
        >
          <span className="font-semibold block truncate">
            <span className="inline xs:hidden">{exam.timeOfDay.charAt(0)}</span>
            <span className="hidden xs:inline">{exam.timeOfDay}</span>
          </span>
          <span className="block truncate">{exam.subject}</span>
        </div>
      ))}
    </div>
  );
}

export default ExamItems;