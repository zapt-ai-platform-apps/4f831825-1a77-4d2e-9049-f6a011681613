import React from 'react';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/react';

function ExamList({ exams, onExamDeleted, onEditExam }) {
  const handleDeleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch('/api/deleteExam', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: examId }),
      });

      if (response.ok) {
        onExamDeleted();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error deleting exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      Sentry.captureException(error);
    }
  };

  const handleEditExam = (exam) => {
    onEditExam(exam);
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 text-center">Upcoming Exams</h3>
      {exams.map((exam) => (
        <div
          key={exam.id}
          className="bg-gray-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2"
        >
          <div>
            <p className="font-semibold text-lg text-black">{exam.subject}</p>
            <p className="text-black">Exam Date: {exam.examDate}</p>
            <p className="text-black">Time of Day: {exam.timeOfDay || 'Morning'}</p>
            <p className="text-black">Board: {exam.board}</p>
            <p className="text-black">Teacher: {exam.teacher}</p>
          </div>
          <div className="flex space-x-2 mt-2 sm:mt-0">
            <button
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={() => handleEditExam(exam)}
            >
              Edit
            </button>
            <button
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={() => handleDeleteExam(exam.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExamList;