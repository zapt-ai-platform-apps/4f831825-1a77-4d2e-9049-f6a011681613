import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import ExamFormFields from './ExamFormFields';
import { saveExam } from '../services/examService';

function ExamForm({ onExamSaved, editExam, onCancelEdit }) {
  const [formData, setFormData] = useState({
    subject: '',
    examDate: '',
    timeOfDay: 'Morning',
    board: '',
    teacher: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editExam) {
      setFormData({
        subject: editExam.subject,
        examDate: editExam.examDate,
        timeOfDay: editExam.timeOfDay || 'Morning',
        board: editExam.board || '',
        teacher: editExam.teacher || '',
      });
    } else {
      setFormData({
        subject: '',
        examDate: '',
        timeOfDay: 'Morning',
        board: '',
        teacher: '',
      });
    }
  }, [editExam]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      await saveExam(formData, editExam);
      onExamSaved();
    } catch (error) {
      console.error('Error saving exam:', error);
      Sentry.captureException(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <ExamFormFields
        formData={formData}
        onChange={handleChange}
        editExam={editExam}
      />
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
          onClick={handleSubmit}
          disabled={submitting}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
            submitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {editExam ? 'Update Exam' : 'Add Exam'}
        </button>
      </div>
    </form>
  );
}

export default ExamForm;