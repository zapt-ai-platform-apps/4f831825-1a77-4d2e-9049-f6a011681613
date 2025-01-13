import React from 'react';
import * as Sentry from '@sentry/react';
import ExamForm from './ExamForm';
import ExamList from './ExamList';
import useExams from '../hooks/useExams';

function Exams() {
  const {
    exams,
    loading,
    editExam,
    handleExamSaved,
    handleEditExam,
    handleCancelEdit,
    handleNext,
  } = useExams();

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
              onExamDeleted={handleExamSaved}
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