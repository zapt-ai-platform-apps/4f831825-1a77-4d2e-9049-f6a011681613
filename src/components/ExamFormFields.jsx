import React from 'react';

function ExamFormFields({ formData, onChange }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium">Subject</label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => onChange('subject', e.target.value)}
          required
          className="mt-1 p-2 w-full border rounded box-border"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Exam Date</label>
        <input
          type="date"
          value={formData.examDate}
          onChange={(e) => onChange('examDate', e.target.value)}
          required
          className="mt-1 p-2 w-full border rounded box-border"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Time of Day</label>
        <select
          value={formData.timeOfDay}
          onChange={(e) => onChange('timeOfDay', e.target.value)}
          className="mt-1 p-2 w-full border rounded box-border"
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
          className="mt-1 p-2 w-full border rounded box-border"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Teacher's Name</label>
        <input
          type="text"
          value={formData.teacher}
          onChange={(e) => onChange('teacher', e.target.value)}
          required
          className="mt-1 p-2 w-full border rounded box-border"
        />
      </div>
    </>
  );
}

export default ExamFormFields;