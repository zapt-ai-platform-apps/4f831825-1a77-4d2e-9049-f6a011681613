import React from 'react';
import * as Sentry from '@sentry/react';
import { supabase } from '../supabaseClient';

function ExamList({ exams = [], onExamDeleted, onEditExam }) {
  const handleDelete = async (id) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }

      const response = await fetch('/api/deleteExam', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
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
            <li
              key={exam.id}
              className="flex justify-between items-center p-2 bg-input rounded-md box-border"
            >
              <div>
                <p className="font-medium">{exam.subject}</p>
                <p className="text-sm text-muted-foreground">{exam.examDate}</p>
                <p className="text-sm text-muted-foreground">Time of Day: {exam.timeOfDay}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => onEditExam(exam)}
                  className="btn px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="btn btn-destructive px-3 py-1 cursor-pointer"
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