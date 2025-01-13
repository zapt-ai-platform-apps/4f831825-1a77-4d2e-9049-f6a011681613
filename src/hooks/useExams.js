import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/react';

function useExams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editExam, setEditExam] = useState(null);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch('/api/getExams', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        setExams(data);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error fetching exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleExamSaved = () => {
    fetchExams();
    setEditExam(null);
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch('/api/generateTimetable', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        window.location.href = '/timetable';
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error generating timetable');
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    exams,
    loading,
    editExam,
    handleExamSaved,
    handleEditExam,
    handleCancelEdit,
    handleNext,
  };
}

export default useExams;