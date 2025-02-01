import React from 'react';

function ExamFormFields({ formData, onChange, editExam }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium">Subject</label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => onChange('subject', e.target.value)}
          required
          className="input mt-1 text-black"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Exam Date</label>
        <input
          type="date"
          value={formData.examDate}
          onChange={(e) => onChange('examDate', e.target.value)}
          required
          className="input mt-1 text-black"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Time of Day</label>
        <select
          value={formData.timeOfDay}
          onChange={(e) => onChange('timeOfDay', e.target.value)}
          className="input mt-1 text-black"
        >
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">Examination Board</label>
        <input
          type="text"
          value={formData.board}
          onChange={(e) => onChange('board', e.target.value)}
          required
          className="input mt-1 text-black"
        />
      </div>
    </>
  );
}

export default ExamFormFields;