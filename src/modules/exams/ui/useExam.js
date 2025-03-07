import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/browser';

/**
 * Generates a random color that isn't red
 * @returns {string} Random hex color that isn't reddish
 */
function generateRandomNonRedColor() {
  // Colors that are visually distinct and not red
  const colors = [
    '#4285F4', // Blue
    '#0F9D58', // Green
    '#F4B400', // Yellow
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
    '#3F51B5', // Indigo
    '#009688', // Teal
    '#795548', // Brown
    '#607D8B', // Blue Grey
    '#673AB7', // Deep Purple
    '#2196F3', // Light Blue
    '#00796B', // Dark Teal
    '#E91E63', // Pink
    '#FFA000', // Amber
    '#4CAF50', // Light Green
    '#8BC34A', // Lime
    '#FF5722', // Deep Orange
  ];
  
  // Pick a random color from the palette
  return colors[Math.floor(Math.random() * colors.length)];
}

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
    examColour: generateRandomNonRedColor(), // Generate a random non-red color for new exams
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false); // Track whether a submission is in progress

  useEffect(() => {
    if (editExam) {
      setFormData({
        subject: editExam.subject || '',
        examDate: editExam.examDate || '',
        timeOfDay: editExam.timeOfDay || 'Morning',
        board: editExam.board || '',
        examColour: editExam.examColour || '#FF0000', // Preserve existing color for edits
      });
    } else {
      setFormData({
        subject: '',
        examDate: '',
        timeOfDay: 'Morning',
        board: '',
        examColour: generateRandomNonRedColor(), // New exams get a random non-red color
      });
    }
    // Reset submission state when exam changes
    setHasSubmitted(false);
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
    // Prevent duplicate submissions
    if (submitting || hasSubmitted) {
      console.log('Preventing duplicate submission');
      return;
    }
    
    // Validate form before submission
    if (!validateForm()) {
      console.error('Form validation failed:', errors);
      return;
    }
    
    console.log('Submitting exam form with data:', formData);
    setSubmitting(true);
    setHasSubmitted(true); // Mark as submitted to prevent duplicates

    try {
      // Create a copy of form data to prevent any reference issues
      const examToSave = { ...formData };
      
      // Instead of calling saveOrUpdateExam directly here, we just pass the data
      // to the parent component through the callback
      if (typeof onExamSaved === 'function') {
        // Pass the exam data to the callback
        await onExamSaved(examToSave);
      }
      
      // Only for new exams, reset the form after successful submission
      if (!editExam) {
        setFormData({
          subject: '',
          examDate: '',
          timeOfDay: 'Morning',
          board: '',
          examColour: generateRandomNonRedColor(), // Generate a new color for the next exam
        });
        // Also reset hasSubmitted flag to allow new submissions
        setHasSubmitted(false);
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      Sentry.captureException(error);
      setErrors({ general: error.message });
      // Reset submitted state on error to allow retrying
      setHasSubmitted(false);
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