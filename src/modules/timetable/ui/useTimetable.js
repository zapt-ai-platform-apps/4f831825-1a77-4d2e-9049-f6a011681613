import { useState, useEffect } from 'react';
import { api as timetableApi } from '../api';
import { api as examsApi } from '../../exams/api';
import { api as preferencesApi } from '../../preferences/api';
import { useMonthNavigation } from './MonthNavigationContext';
import { formatDatesWithData, buildSubjectColorMapping } from '../internal/service';
import * as Sentry from '@sentry/browser';

/**
 * Hook for managing timetable state and actions
 * @returns {Object} Timetable state and actions
 */
export function useTimetable() {
  // Timetable state
  const [timetable, setTimetable] = useState({});
  const [exams, setExams] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datesWithData, setDatesWithData] = useState({});
  const [subjectColours, setSubjectColours] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [periodAvailability, setPeriodAvailability] = useState([]);

  // Get month navigation from context
  const monthNavigation = useMonthNavigation();

  // Fetch timetable, exams, and preferences
  const fetchTimetable = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch data concurrently
      const [timetableResult, examsResult, preferencesResult] = await Promise.all([
        timetableApi.getTimetable(),
        examsApi.getExams(),
        preferencesApi.getPreferences(),
      ]);

      setTimetable(timetableResult.data || {});
      setExams(examsResult || []);
      setPreferences(preferencesResult || null);
      
      // Extract period-specific availability if available
      if (timetableResult.periodAvailability) {
        setPeriodAvailability(timetableResult.periodAvailability);
      }

      // Format dates with data and build subject colors
      const { datesWithData: formattedDates, subjectsSet } = formatDatesWithData(
        timetableResult.data || {},
        examsResult || []
      );
      
      setDatesWithData(formattedDates);
      setSubjectColours(buildSubjectColorMapping(subjectsSet, examsResult || []));

      // Update month limits based on preferences and exams
      monthNavigation.updateMonthLimits(preferencesResult, examsResult);

    } catch (error) {
      console.error('Error fetching timetable data:', error);
      Sentry.captureException(error);
      setError('Failed to load timetable data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle date click in calendar
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  return {
    timetable,
    exams,
    preferences,
    loading,
    error,
    datesWithData,
    subjectColours,
    selectedDate,
    periodAvailability,
    fetchTimetable,
    handleDateClick,
    
    // Month navigation properties from separate context
    currentMonth: monthNavigation.currentMonth,
    minDate: monthNavigation.minDate,
    maxDate: monthNavigation.maxDate,
    handlePrevMonth: monthNavigation.handlePrevMonth,
    handleNextMonth: monthNavigation.handleNextMonth
  };
}