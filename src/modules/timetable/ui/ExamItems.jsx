import React from 'react';

/**
 * Component to display exam items in a calendar day
 * @param {Object} props - Component props
 * @param {Array} props.exams - Exams for this day
 * @returns {React.ReactElement} Exam items component
 */
function ExamItems({ exams }) {
  return (
    <div className="space-y-0.5 overflow-hidden max-w-full">
      {exams.map((exam, idx) => (
        <div
          key={idx}
          className="bg-destructive text-white py-0.5 px-1 rounded text-[8px] xs:text-[9px] sm:text-xs overflow-hidden"
          title={`Exam: ${exam.subject} (${exam.timeOfDay || 'Morning'})`}
        >
          <p className="font-bold truncate w-full">EXAM</p>
          <p className="truncate w-full">{exam.subject}</p>
        </div>
      ))}
    </div>
  );
}

export default ExamItems;