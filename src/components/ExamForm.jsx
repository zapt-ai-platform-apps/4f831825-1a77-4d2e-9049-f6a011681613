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
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-semibold transition-colors duration-200 text-black cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={submitting}
          className={`px-4 py-2 rounded-md font-semibold transition-transform duration-300 transform hover:scale-[1.02] text-white ${
            editExam
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-green-600 hover:bg-green-700'
          } ${submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {editExam ? 'Update Exam' : 'Add Exam'}
        </button>
      </div>
    </form>
  );
}

export default ExamForm;