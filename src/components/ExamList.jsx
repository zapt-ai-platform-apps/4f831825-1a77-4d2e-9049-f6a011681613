import React from 'react';
import * as Sentry from '@sentry/react';

function ExamList({ exams = [], onExamDeleted, onEditExam }) {
  const handleDelete = async (id) => {
    try {
      const response = await fetch('/api/deleteExam', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete exam.');
      }

      onExamDeleted();
    } catch (error) {
      console.error('Error deleting exam:', error);
      Sentry.captureException(error);
    }
  };

  return (
    <div className="h-full">
      <h3 className="text-xl font-semibold">Your Exams</h3>
      {exams.length === 0 ? (
        <p>No exams added yet.</p>
      ) : (
        <ul className="space-y-2">
          {exams.map((exam) => (
            <li key={exam.id} className="flex justify-between items-center p-2 bg-gray-100 rounded box-border">
              <div>
                <p className="font-medium">{exam.subject}</p>
                <p className="text-sm text-gray-600">{exam.examDate}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => onEditExam(exam)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ExamList;