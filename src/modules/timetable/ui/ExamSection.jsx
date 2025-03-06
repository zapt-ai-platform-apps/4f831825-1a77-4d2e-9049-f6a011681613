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
      <h4 className="text-lg font-semibold mb-2">Exams</h4>
      <div className="space-y-3">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-3 rounded-lg border-l-4"
            style={{ borderColor: exam.examColour || 'red' }}
          >
            <p className="font-semibold flex items-center text-sm sm:text-base">
              <span
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: exam.examColour || 'red' }}
              ></span>
              {exam.timeOfDay} Exam
            </p>
            <p className="text-black text-base sm:text-lg font-bold">{exam.subject}</p>
            {exam.board && <p className="text-gray-600 text-xs sm:text-sm">Board: {exam.board}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExamSection;