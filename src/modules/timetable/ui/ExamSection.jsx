import React from 'react';

/**
 * Component to display exam section in day details
 * @param {Object} props - Component props
 * @param {Array} props.exams - Exams for this day
 * @returns {React.ReactElement} Exam section component
 */
function ExamSection({ exams }) {
  if (!exams) return null;

  const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };
  exams.sort((a, b) => blockOrder[a.timeOfDay] - blockOrder[b.timeOfDay]);

  return (
    <div>
      <h4 className="text-base font-semibold mb-1.5 dark:text-white">Exams</h4>
      <div className="space-y-2">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-2 rounded-lg border-l-4 bg-red-100 dark:bg-red-900/30"
            style={{ borderColor: 'red' }}
          >
            <p className="font-semibold flex items-center text-xs sm:text-sm dark:text-white">
              <span
                className="w-2.5 h-2.5 rounded-full mr-1.5"
                style={{ backgroundColor: 'red' }}
              ></span>
              {exam.timeOfDay} Exam
            </p>
            <p className="text-black dark:text-white text-sm sm:text-base font-bold">{exam.subject}</p>
            {exam.board && <p className="text-gray-600 dark:text-gray-300 text-xs">Board: {exam.board}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExamSection;