import React from 'react';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/react';

function ExamList({ exams = [], onExamDeleted, onEditExam }) {
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('exams').delete().eq('id', id);
      if (error) throw error;
      onExamDeleted();
    } catch (error) {
      console.error('Error deleting exam:', error);
      Sentry.captureException(error);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Your Exams</h3>
      {exams.length === 0 ? (
        <p>No exams added yet.</p>
      ) : (
        <ul className="space-y-2">
          {exams.map((exam) => (
            <li key={exam.id} className="flex justify-between items-center p-2 bg-gray-100 rounded">
              <div>
                <p className="font-medium">{exam.subject}</p>
                <p className="text-sm text-gray-600">{exam.examDate}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => onEditExam(exam)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
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