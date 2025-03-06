import { useExamsState } from '../internal/state';

/**
 * Hook for accessing exams state and actions in UI components
 * @returns {Object} Exams state and actions
 */
export function useExams() {
  const examsState = useExamsState();
  
  // Return public API only
  return {
    exams: examsState.exams,
    editExam: examsState.editExam,
    loading: examsState.loading,
    generating: examsState.generating,
    error: examsState.error,
    handleExamSaved: examsState.handleExamSaved,
    handleExamDeleted: examsState.handleExamDeleted,
    handleEditExam: examsState.handleEditExam,
    handleCancelEdit: examsState.handleCancelEdit,
    handleGenerateTimetable: examsState.handleGenerateTimetable
  };
}