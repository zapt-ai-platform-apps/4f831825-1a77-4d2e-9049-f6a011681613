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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editExam) {
      setFormData({
        subject: editExam.subject || '',
        examDate: editExam.examDate || '',
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.subject) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.examDate) {
      newErrors.examDate = 'Exam date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    
    // Validate form before submission
    if (!validateForm()) {
      console.error('Form validation failed:', errors);
      return;
    }
    
    console.log('Submitting exam form with data:', formData);
    setSubmitting(true);

    try {
      // Create a copy of form data to prevent any reference issues
      const examToSave = { ...formData };
      
      const result = await saveOrUpdateExam(examToSave, editExam);
      
      if (result.success) {
        if (typeof onExamSaved === 'function') {
          // Pass the exam data to the callback - this was missing before
          onExamSaved(examToSave);
        }
      } else {
        // Handle error from service
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      Sentry.captureException(error);
      setErrors({ general: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field when it changes
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  return {
    formData,
    submitting,
    errors,
    handleSubmit,
    handleChange,
  };
}