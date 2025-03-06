import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExams } from './useExams';
import ExamForm from './ExamForm';
import ExamList from './ExamList';
import LoadingOverlay from '../../../shared/components/LoadingOverlay';

/**
 * Exams management screen component
 * @returns {React.ReactElement} Exams screen
 */
function ExamsScreen() {
  const navigate = useNavigate();
  const {
    exams,
    editExam,
    loading,
    generating,
    handleExamSaved,
    handleExamDeleted,
    handleEditExam,
    handleCancelEdit,
    handleGenerateTimetable
  } = useExams();

  const onGenerateTimetable = async () => {
    const result = await handleGenerateTimetable();
    if (result.success) {
      navigate('/timetable');
    }
  };

  return (
    <div className="h-full flex flex-col text-white">
      {(loading || generating) && (
        <LoadingOverlay message={generating ? "Generating your new timetable..." : "Loading exams..."} />
      )}
      
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
              className={`btn btn-primary w-full px-6 py-3 transition-transform duration-300 ease-in-out transform hover:scale-[1.02] cursor-pointer ${
                loading || generating ? 'opacity-50 cursor-not-allowed' : ''
              } text-sm md:text-base`}
              onClick={onGenerateTimetable}
              disabled={loading || generating}
            >
              Generate Timetable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamsScreen;