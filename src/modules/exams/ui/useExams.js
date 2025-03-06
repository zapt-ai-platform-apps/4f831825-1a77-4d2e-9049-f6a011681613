import { useState, useEffect } from 'react';
import { api as examsApi } from '../api';
import { saveOrUpdateExam, deleteExam, generateTimetable } from '../internal/service';
import { eventBus } from '../../core/events';
import { events } from '../events';
import * as Sentry from '@sentry/browser';

/**
 * Hook for managing exams state and actions
 * @returns {Object} Exams state and methods
 */
export function useExams() {
  const [exams, setExams] = useState([]);
  const [editExam, setEditExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Load exams on mount
  useEffect(() => {
    fetchExams();
    
    // Subscribe to exam-related events
    const createdSubscription = eventBus.subscribe(events.CREATED, () => fetchExams());
    const updatedSubscription = eventBus.subscribe(events.UPDATED, () => fetchExams());
    const deletedSubscription = eventBus.subscribe(events.DELETED, () => fetchExams());
    
    return () => {
      createdSubscription();
      updatedSubscription();
      deletedSubscription();
    };
  }, []);

  // Fetch exams from API
  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await examsApi.getExams();
      setExams(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching exams:', error);
      Sentry.captureException(error);
      setError('Failed to load exams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle save exam - updated to ensure exam parameter is used
  const handleExamSaved = async (exam) => {
    try {
      if (!exam) {
        console.error('No exam data provided to handleExamSaved');
        return { success: false, error: 'No exam data provided' };
      }
      
      console.log('handleExamSaved received exam:', exam);
      await saveOrUpdateExam(exam, editExam);
      setEditExam(null);
      return { success: true };
    } catch (error) {
      console.error('Error saving exam:', error);
      Sentry.captureException(error);
      return { success: false, error: error.message };
    }
  };

  // Handle delete exam
  const handleExamDeleted = async (id) => {
    try {
      await deleteExam(id);
      return { success: true };
    } catch (error) {
      console.error('Error deleting exam:', error);
      Sentry.captureException(error);
      return { success: false, error: error.message };
    }
  };

  // Handle edit exam
  const handleEditExam = (exam) => {
    setEditExam(exam);
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditExam(null);
  };

  // Handle generate timetable
  const handleGenerateTimetable = async () => {
    try {
      setGenerating(true);
      await generateTimetable();
      
      // Wait a moment for the backend to finish processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { success: true };
    } catch (error) {
      console.error('Error generating timetable:', error);
      Sentry.captureException(error);
      setError(error.message || 'Failed to generate timetable');
      return { success: false, error: error.message };
    } finally {
      setGenerating(false);
    }
  };

  return {
    exams,
    editExam,
    loading,
    generating,
    error,
    handleExamSaved,
    handleExamDeleted,
    handleEditExam,
    handleCancelEdit,
    handleGenerateTimetable
  };
}