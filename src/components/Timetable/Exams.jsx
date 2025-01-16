import React from 'react';

function Exams({ exams }) {
  return (
    <div className="hidden sm:block mb-2 px-1">
      {exams.map((exam) => (
        <div
          key={exam.id}
          className="mb-1 p-2 rounded-lg text-white cursor-pointer"
          style={{ backgroundColor: '#FF0000' }}
        >
          <div className="font-bold text-base">Exam: {exam.subject}</div>
          <div className="text-sm">Time of Day: {exam.timeOfDay || 'Morning'}</div>
        </div>
      ))}
    </div>
  );
}

export default Exams;