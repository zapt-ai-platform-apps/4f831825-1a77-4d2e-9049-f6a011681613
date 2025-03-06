import React from 'react';
import ExamFormFields from './ExamFormFields';
import { useExamForm } from './useExam';

/**
 * Form component for adding or editing an exam
 * @param {Object} props - Component props
 * @param {Function} props.onExamSaved - Callback when exam is saved
 * @param {Object} props.editExam - Exam to edit (null for new exam)
 * @param {Function} props.onCancelEdit - Callback when edit is cancelled
 * @returns {React.ReactElement} Exam form
 */
function ExamForm({ onExamSaved, editExam, onCancelEdit }) {
  const { formData, submitting, errors, handleSubmit, handleChange } = useExamForm(editExam, onExamSaved);

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      // Don't call handleSubmit here - only call it from the button
    }} className="space-y-4">
      <ExamFormFields
        formData={formData}
        onChange={handleChange}
        editExam={editExam}
        errors={errors}
      />
      
      {/* Display general error if it exists */}
      {errors.general && (
        <div className="text-red-500 text-sm mt-2">{errors.general}</div>
      )}
      
      <div className="flex justify-end space-x-4 mt-4">
        {editExam && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="btn px-4 py-2 bg-input text-black hover:bg-gray-300 cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="button" // Changed from submit to button to avoid form submission
          onClick={handleSubmit}
          disabled={submitting}
          className={`btn text-white cursor-pointer ${
            editExam ? 'btn-primary' : 'bg-primary hover:bg-primary/90'
          } px-4 py-2 transition-transform duration-300 transform hover:scale-[1.02] ${
            submitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? (
            <span>
              {editExam ? 'Updating...' : 'Adding...'} 
              <span className="loading-dots"></span>
            </span>
          ) : (
            editExam ? 'Update Exam' : 'Add Exam'
          )}
        </button>
      </div>
    </form>
  );
}

export default ExamForm;