import React from 'react';
import { blockPriority } from '../../../services/constants.js';

function Exams({ exams }) {
  if (!exams) return null;

  // Sort exams so that Morning appears first, then Afternoon, then Evening
  exams.sort((a, b) => blockPriority[a.timeOfDay] - blockPriority[b.timeOfDay]);

  return (
    <div className="mb-2 px-1 space-y-1">
      {exams.map((exam) => (
        <div
          key={exam.id}
          className="p-1 rounded text-xs sm:text-sm cursor-pointer whitespace-nowrap overflow-hidden"
          style={{ backgroundColor: 'red' }}
        >
          <span className="font-semibold">{exam.timeOfDay}</span> – <span>{exam.subject}</span>
        </div>
      ))}
    </div>
  );
}

export default Exams;