import React from 'react';

function ExamSection({ exams }) {
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div>
      <h4 className="text-lg font-semibold mb-2">Exams</h4>
      <div className="space-y-4">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-4 rounded-lg text-white cursor-pointer"
            style={{ backgroundColor: '#FF0000' }} // Bright red color for exams
          >
            <p className="font-semibold text-2xl">Exam: {capitalizeFirstLetter(exam.subject)}</p>
            <p>Time of Day: {exam.timeOfDay || 'Morning'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExamSection;