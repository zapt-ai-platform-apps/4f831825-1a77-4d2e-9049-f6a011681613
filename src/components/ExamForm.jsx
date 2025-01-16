import React from 'react';
import ExamFormFields from './ExamFormFields';
import useExamForm from '../hooks/useExamForm';

function ExamForm({ onExamSaved, editExam, onCancelEdit }) {
  const { formData, submitting, handleSubmit, handleChange } = useExamForm(editExam, onExamSaved);

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <ExamFormFields
        formData={formData}
        onChange={handleChange}
        editExam={editExam}
      />
      <div className="flex justify-end space-x-4 mt-4">
        {editExam && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="btn bg-input text-black hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={submitting}
          className={`btn ${
            editExam ? 'btn-primary' : 'bg-primary hover:bg-primary/90'
          } px-4 py-2 transition-transform duration-300 transform hover:scale-[1.02] ${
            submitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {editExam ? 'Update Exam' : 'Add Exam'}
        </button>
      </div>
    </form>
  );
}

export default ExamForm;