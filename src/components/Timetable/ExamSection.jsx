import React from 'react';
import { blockPriority } from '../../../services/constants.js';

function ExamSection({ exams, subjectColours }) {
  if (!exams) return null;

  exams.sort((a, b) => blockPriority[a.timeOfDay] - blockPriority[b.timeOfDay]);

  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">Exams</h4>
      <div className="space-y-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-1 rounded text-xs sm:text-sm cursor-pointer"
            style={{ backgroundColor: subjectColours?.[exam.subject] || '#ccc' }}
          >
            <span className="font-semibold">{exam.subject}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExamSection;