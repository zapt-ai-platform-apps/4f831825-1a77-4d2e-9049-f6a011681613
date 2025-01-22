import React from 'react';
import { useExams } from '../hooks/useExams';
import ExamForm from './ExamForm';
import ExamList from './ExamList';
import LoadingOverlay from './LoadingOverlay';

function Exams() {
  const {
    exams,
    editExam,
    loading,
    handleExamSaved,
    handleExamDeleted,
    handleEditExam,
    handleCancelEdit,
    handleNext,
  } = useExams();

  return (
    <div className="h-full flex flex-col text-white">
      {loading && <LoadingOverlay message="Generating your new timetable..." />}
      <div className="flex-grow p-4">
        <div className="card p-4 md:p-8 w-full md:max-w-screen-xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center">Manage Your Exams</h2>
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
              className={`btn btn-primary w-full px-6 py-3 transition-transform duration-300 ease-in-out transform hover:scale-[1.02] ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              } text-sm md:text-base`}
              onClick={handleNext}
              disabled={loading}
            >
              Generate Timetable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Exams;