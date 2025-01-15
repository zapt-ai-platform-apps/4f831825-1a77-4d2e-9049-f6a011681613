import React from 'react';
import * as Sentry from '@sentry/react';
import ExamFormFields from './ExamFormFields';
import { saveExam } from '../services/examService';

function ExamForm({ onExamSaved, editExam, onCancelEdit }) {
  const handleSubmit = async (formData) => {
    try {
      await saveExam(formData, editExam);
      onExamSaved();
    } catch (error) {
      console.error('Error saving exam:', error);
      Sentry.captureException(error);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <ExamFormFields editExam={editExam} />
      <div className="flex justify-end space-x-2">
        {editExam && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          {editExam ? 'Update Exam' : 'Add Exam'}
        </button>
      </div>
    </form>
  );
}

export default ExamForm;
