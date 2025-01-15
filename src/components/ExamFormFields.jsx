import React, { useState, useEffect } from 'react';

function ExamFormFields({ editExam }) {
  const [examSubject, setExamSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('Morning');
  const [board, setBoard] = useState('');
  const [teacher, setTeacher] = useState('');

  useEffect(() => {
    if (editExam) {
      setExamSubject(editExam.subject);
      setExamDate(editExam.examDate);
      setTimeOfDay(editExam.timeOfDay || 'Morning');
      setBoard(editExam.board || '');
      setTeacher(editExam.teacher || '');
    } else {
      setExamSubject('');
      setExamDate('');
      setTimeOfDay('Morning');
      setBoard('');
      setTeacher('');
    }
  }, [editExam]);

  return (
    <>
      <div>
        <label className="block text-sm font-medium">Subject</label>
        <input
          type="text"
          value={examSubject}
          onChange={(e) => setExamSubject(e.target.value)}
          required
          className="mt-1 p-2 w-full border rounded box-border cursor-pointer"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Exam Date</label>
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          required
          className="mt-1 p-2 w-full border rounded box-border cursor-pointer"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Time of Day</label>
        <select
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          className="mt-1 p-2 w-full border rounded box-border cursor-pointer"
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
          value={board}
          onChange={(e) => setBoard(e.target.value)}
          required
          className="mt-1 p-2 w-full border rounded box-border cursor-pointer"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Teacher's Name</label>
        <input
          type="text"
          value={teacher}
          onChange={(e) => setTeacher(e.target.value)}
          required
          className="mt-1 p-2 w-full border rounded box-border cursor-pointer"
        />
      </div>
    </>
  );
}

export default ExamFormFields;
