import { useTimetableState } from '../internal/state';
import { useMonthNavigation } from './MonthNavigationContext';

/**
 * Hook for accessing timetable state and actions in UI components
 * @returns {Object} Timetable state and actions
 */
export function useTimetable() {
  const timetableState = useTimetableState();
  const monthNavigation = useMonthNavigation();
  
  // Return public API only
  return {
    timetable: timetableState.timetable,
    exams: timetableState.exams,
    preferences: timetableState.preferences,
    loading: timetableState.loading,
    error: timetableState.error,
    datesWithData: timetableState.datesWithData,
    subjectColours: timetableState.subjectColours,
    selectedDate: timetableState.selectedDate,
    refreshTimetable: timetableState.fetchTimetable,
    handleDateClick: timetableState.handleDateClick,
    
    // Month navigation properties from separate context
    currentMonth: monthNavigation.currentMonth,
    minDate: monthNavigation.minDate,
    maxDate: monthNavigation.maxDate,
    handlePrevMonth: monthNavigation.handlePrevMonth,
    handleNextMonth: monthNavigation.handleNextMonth
  };
}