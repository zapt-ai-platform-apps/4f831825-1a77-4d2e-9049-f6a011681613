import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/browser';
import { saveOrUpdateExam } from '../internal/service';

/**
 * Hook for managing exam form state
 * @param {Object} editExam - Exam to edit (null for new exam)
 * @param {Function} onExamSaved - Callback when exam is saved
 * @returns {Object} Form state and handlers
 */
export function useExamForm(editExam, onExamSaved) {
  const [formData, setFormData] = useState({
    subject: '',
    examDate: '',
    timeOfDay: 'Morning',
    board: '',
    examColour: '#ffffff',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editExam) {
      setFormData({
        subject: editExam.subject,
        examDate: editExam.examDate,
        timeOfDay: editExam.timeOfDay || 'Morning',
        board: editExam.board || '',
        examColour: editExam.examColour || '#ffffff',
      });
    } else {
      setFormData({
        subject: '',
        examDate: '',
        timeOfDay: 'Morning',
        board: '',
        examColour: '#ffffff',
      });
    }
  }, [editExam]);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      await saveOrUpdateExam(formData, editExam);
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

  return {
    formData,
    submitting,
    handleSubmit,
    handleChange,
  };
}