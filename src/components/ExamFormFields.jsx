import React from 'react';

const timeOptions = ['Morning', 'Afternoon', 'Evening'];

function ExamFormFields({ examData, handleInputChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="text"
        name="subject"
        placeholder="Subject"
        value={examData.subject}
        onChange={handleInputChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border"
      />
      <input
        type="date"
        name="examDate"
        placeholder="Exam Date"
        value={examData.examDate}
        onChange={handleInputChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border"
      />
      <select
        name="timeOfDay"
        value={examData.timeOfDay}
        onChange={handleInputChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border cursor-pointer"
      >
        {timeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <input
        type="text"
        name="board"
        placeholder="Examination Board"
        value={examData.board}
        onChange={handleInputChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border"
      />
      <input
        type="text"
        name="teacher"
        placeholder="Teacher's Name"
        value={examData.teacher}
        onChange={handleInputChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border"
      />
    </div>
  );
}

export default ExamFormFields;