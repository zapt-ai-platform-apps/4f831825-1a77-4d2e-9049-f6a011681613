import { useTimetableState } from '../internal/state';

/**
 * Hook for accessing timetable state and actions in UI components
 * @returns {Object} Timetable state and actions
 */
export function useTimetable() {
  const timetableState = useTimetableState();
  
  // Return public API only
  return {
    timetable: timetableState.timetable,
    exams: timetableState.exams,
    preferences: timetableState.preferences,
    loading: timetableState.loading,
    error: timetableState.error,
    datesWithData: timetableState.datesWithData,
    subjectColours: timetableState.subjectColours,
    currentMonth: timetableState.currentMonth,
    setCurrentMonth: timetableState.setCurrentMonth,
    selectedDate: timetableState.selectedDate,
    minDate: timetableState.minDate,
    maxDate: timetableState.maxDate,
    handlePrevMonth: timetableState.handlePrevMonth,
    handleNextMonth: timetableState.handleNextMonth,
    handleDateClick: timetableState.handleDateClick,
    refreshTimetable: timetableState.fetchTimetable
  };
}