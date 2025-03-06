import React from 'react';
import * as Sentry from '@sentry/browser';
import ExamListItem from './ExamListItem';

/**
 * Component for displaying a list of exams
 * @param {Object} props - Component props
 * @param {Array} props.exams - Array of exam objects
 * @param {Function} props.onExamDeleted - Callback when exam is deleted
 * @param {Function} props.onEditExam - Callback when exam is edited
 * @returns {React.ReactElement} Exam list
 */
function ExamList({ exams = [], onExamDeleted, onEditExam }) {
  const handleDelete = async (id) => {
    try {
      await onExamDeleted(id);
    } catch (error) {
      console.error('Error deleting exam:', error);
      Sentry.captureException(error);
    }
  };

  return (
    <div className="h-full">
      <h3 className="text-xl font-semibold mb-4 text-white">Your Exams</h3>
      {exams.length === 0 ? (
        <p className="text-muted-foreground">No exams added yet</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <ExamListItem
              key={exam.id}
              exam={exam}
              onEdit={onEditExam}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ExamList;