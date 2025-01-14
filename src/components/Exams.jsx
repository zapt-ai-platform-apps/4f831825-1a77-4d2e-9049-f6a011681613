import React, { useState } from 'react';
import * as Sentry from '@sentry/react';
import { supabase } from '../supabaseClient';
import ExamForm from './ExamForm';
import ExamList from './ExamList';

function Exams({
  exams,
  setExams,
  preferences,
  timetable,
  setTimetable,
  refetchExams,
}) {
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

  return (
    <div className="h-full flex flex-col text-white">
      <div className="flex-grow p-4 flex items-center justify-center">
        <div className="w-full max-w-full sm:max-w-4xl bg-white/90 rounded-lg p-6 shadow-lg text-black">
          <h2 className="text-2xl font-bold mb-4 text-center">Manage Your Exams</h2>
          <div className="space-y-6">
            <ExamForm
              onExamSaved={handleExamSaved}
              editExam={editExam}
              onCancelEdit={handleCancelEdit}
            />
            <ExamList
              exams={exams}
              onExamDeleted={handleExamDeleted}
              onEditExam={handleEditExam}
            />
            <button
              className={`w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? 'Generating Timetable...' : 'Generate Timetable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Exams;