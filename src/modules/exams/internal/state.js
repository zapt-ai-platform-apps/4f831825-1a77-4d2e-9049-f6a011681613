import { useState, useEffect } from 'react';
import { api as examsApi } from '../api';
import { saveOrUpdateExam, deleteExam as deleteExamService, generateTimetable } from './service';
import { eventBus } from '../../core/events';
import { events } from '../events';
import * as Sentry from '@sentry/browser';

/**
 * Hook for managing exams state
 * @returns {Object} Exams state and methods
 */
export function useExamsState() {
  const [exams, setExams] = useState([]);
  const [editExam, setEditExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch exams on mount
  useEffect(() => {
    fetchExams();
    
    // Listen for exam events to update exams list
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
    setLoading(true);
    setError(null);
    
    try {
      const data = await examsApi.getExams();
      setExams(data);
      eventBus.publish(events.LOADED, { exams: data });
    } catch (error) {
      console.error('Error fetching exams:', error);
      Sentry.captureException(error);
      setError('Failed to load exams. Please try again.');
      eventBus.publish(events.ERROR, { error: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle exam save/update
  const handleExamSaved = async (examData) => {
    try {
      await saveOrUpdateExam(examData, editExam);
      setEditExam(null);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };
  
  // Handle exam delete
  const handleExamDeleted = async (id) => {
    try {
      await deleteExamService(id);
      return { success: true };
    } catch (error) {
      setError(error.message);
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
    setGenerating(true);
    setError(null);
    
    try {
      await generateTimetable();
      return { success: true };
    } catch (error) {
      console.error('Error generating timetable:', error);
      Sentry.captureException(error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setGenerating(false);
    }
  };
  
  return {
    exams,
    setExams,
    editExam,
    loading,
    generating,
    error,
    fetchExams,
    handleExamSaved,
    handleExamDeleted,
    handleEditExam,
    handleCancelEdit,
    handleGenerateTimetable
  };
}