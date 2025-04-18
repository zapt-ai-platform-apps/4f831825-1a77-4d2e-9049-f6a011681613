import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExams } from './useExams';
import ExamForm from './ExamForm';
import ExamList from './ExamList';
import LoadingOverlay from '../../../shared/components/LoadingOverlay';
import { api as timetableApi } from '../../timetable/api';
import * as Sentry from '@sentry/browser';

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
    error,
    handleExamSaved,
    handleExamDeleted,
    handleEditExam,
    handleCancelEdit,
    handleGenerateTimetable
  } = useExams();

  /**
   * Handle generate timetable button click
   * This ensures timetable data is available before navigation
   */
  const onGenerateTimetable = async () => {
    try {
      // Generate the timetable
      const result = await handleGenerateTimetable();
      
      if (result.success) {
        console.log("Timetable generation successful, fetching timetable data...");
        
        // Fetch the timetable data to ensure it's in the cache
        await timetableApi.getTimetable();
        console.log("Timetable data fetched successfully, navigating...");
        
        // Navigate to the timetable screen
        navigate('/timetable');
      } else if (result.error) {
        // Display error message
        alert(`Failed to generate timetable: ${result.error}`);
        console.error("Timetable generation failed:", result.error);
      }
    } catch (error) {
      console.error("Error during timetable generation workflow:", error);
      Sentry.captureException(error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="h-full flex flex-col text-gray-800 dark:text-gray-200">
      {(loading || generating) && (
        <LoadingOverlay message={generating ? "Generating your new timetable..." : "Loading exams..."} />
      )}
      
      <div className="flex-grow p-4">
        <div className="bg-white dark:bg-gray-800 p-4 md:p-8 rounded-lg shadow-md w-full md:max-w-screen-xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-200">Manage Your Exams</h2>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-500 dark:border-red-500/50 text-red-700 dark:text-red-300 p-3 rounded-md mb-4">
              <p className="font-medium">Error: {error}</p>
            </div>
          )}
          
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
              className={`btn btn-primary w-full px-6 py-3 transition-transform duration-300 ease-in-out transform hover:scale-[1.02] cursor-pointer bg-primary dark:bg-primary text-white dark:text-white rounded-lg ${
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