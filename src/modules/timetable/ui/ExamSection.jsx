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
      <h4 className="text-lg font-semibold mb-2 dark:text-white">Exams</h4>
      <div className="space-y-3">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-3 rounded-lg border-l-4 bg-red-100 dark:bg-red-900/30"
            style={{ borderColor: 'red' }}
          >
            <p className="font-semibold flex items-center text-sm sm:text-base dark:text-white">
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: 'red' }}
              ></span>
              {exam.timeOfDay} Exam
            </p>
            <p className="text-black dark:text-white text-base sm:text-lg font-bold">{exam.subject}</p>
            {exam.board && <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Board: {exam.board}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExamSection;