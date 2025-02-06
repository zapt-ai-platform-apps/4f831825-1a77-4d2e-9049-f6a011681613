import React from 'react';
import { blockPriority } from '../../../services/constants.js';

function ExamSection({ exams }) {
  if (!exams) return null;

  exams.sort((a, b) => blockPriority[a.timeOfDay] - blockPriority[b.timeOfDay]);

  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">Exams</h4>
      <div className="space-y-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-1 rounded text-xs sm:text-sm cursor-pointer whitespace-nowrap overflow-hidden"
            style={{ backgroundColor: 'red' }}
          >
            <div>
              <span className="font-semibold block">{exam.timeOfDay}</span>
              <span className="block">{exam.subject}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExamSection;