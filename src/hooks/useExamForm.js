import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { saveExam } from '../services/examService';

function useExamForm(editExam, onExamSaved) {
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

  return {
    formData,
    submitting,
    handleSubmit,
    handleChange,
  };
}

export default useExamForm;