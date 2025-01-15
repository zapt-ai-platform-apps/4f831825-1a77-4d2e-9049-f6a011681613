import { useState } from 'react';
import * as Sentry from '@sentry/react';
import { supabase } from '../supabaseClient';
import { useTimetable } from '../contexts/TimetableContext';
import { generateTimetable } from '../services/timetableService';
import { fetchTimetable } from '../fetchTimetable';
import { useNavigate } from 'react-router-dom';

export function useExams() {
  const navigate = useNavigate();
  const { exams, setExams, refetchExams, preferences, timetable, setTimetable } = useTimetable();
  const [editExam, setEditExam] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleExamSaved = () => {
    refetchExams();
    setEditExam(null);
  };

  const handleExamDeleted = () => {
    refetchExams();
  };

  const handleEditExam = (exam) => {
    setEditExam(exam);
  };

  const handleCancelEdit = () => {
    setEditExam(null);
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      await generateTimetable(supabase);
      const newTimetable = await fetchTimetable();
      setTimetable(newTimetable);
      navigate('/timetable');
    } catch (error) {
      console.error('Error generating timetable:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    exams,
    editExam,
    loading,
    handleExamSaved,
    handleExamDeleted,
    handleEditExam,
    handleCancelEdit,
    handleNext,
  };
}