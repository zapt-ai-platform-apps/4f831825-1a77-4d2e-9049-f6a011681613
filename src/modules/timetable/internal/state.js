import { useState, useEffect, useCallback, useRef } from 'react';
import { api as timetableApi } from '../api';
import { api as examsApi } from '../../exams/api';
import { api as preferencesApi } from '../../preferences/api';
import { formatDatesWithData, buildSubjectColorMapping } from './service';
import { eventBus, events } from '../../core/events';
import * as Sentry from '@sentry/browser';
import { useMonthNavigation } from '../ui/MonthNavigationContext';

/**
 * Hook for managing timetable state
 * @returns {Object} Timetable state and methods
 */
export function useTimetableState() {
  const [timetable, setTimetable] = useState({});
  const [exams, setExams] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datesWithData, setDatesWithData] = useState({});
  const [subjectColours, setSubjectColours] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Get month navigation state from context
  const { 
    currentMonth, 
    updateMonthLimits,
    handlePrevMonth,
    handleNextMonth
  } = useMonthNavigation();
  
  // Use a ref to track if a request is in progress to prevent duplicates
  const isFetchingRef = useRef(false);
  
  /**
   * Fetch timetable data
   * Wrapped in useCallback to maintain stable reference
   */
  const fetchTimetable = useCallback(async () => {
    // Skip if already fetching to prevent duplicate requests
    if (isFetchingRef.current) {
      console.log('Timetable fetch already in progress, skipping duplicate request');
      return;
    }
    
    isFetchingRef.current = true;
    console.log('Fetching timetable data...');
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch timetable, exams, and preferences in parallel
      const [timetableData, examsData, preferencesData] = await Promise.all([
        timetableApi.getTimetable(),
        examsApi.getExams(),
        preferencesApi.getPreferences()
      ]);
      
      // Update state with fetched data
      setTimetable(timetableData);
      setExams(examsData);
      setPreferences(preferencesData);
      
      // Calculate derived data
      const { datesWithData: formattedDates, subjectsSet } = formatDatesWithData(timetableData, examsData);
      setDatesWithData(formattedDates);
      
      // Build subject color mapping
      const colours = buildSubjectColorMapping(subjectsSet, examsData);
      setSubjectColours(colours);
      
      // Update month limits in the shared context
      updateMonthLimits(preferencesData, examsData);
      
      console.log('Timetable data fetched successfully');
    } catch (error) {
      console.error('Error fetching timetable data:', error);
      Sentry.captureException(error);
      setError('Failed to load timetable. Please try again.');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [updateMonthLimits]); // Include updateMonthLimits in dependencies
  
  // Set up event listeners for timetable updates
  useEffect(() => {
    const timetableUpdatedUnsubscribe = eventBus.subscribe(events.TIMETABLE_UPDATED, () => {
      console.log('Timetable updated, refreshing data...');
      fetchTimetable();
    });
    
    return () => {
      timetableUpdatedUnsubscribe();
    };
  }, [fetchTimetable]);
  
  // Handle date click
  const handleDateClick = useCallback((date) => {
    setSelectedDate(date);
  }, []);
  
  return {
    timetable,
    exams,
    preferences,
    loading,
    error,
    datesWithData,
    subjectColours,
    currentMonth,
    selectedDate,
    handlePrevMonth,
    handleNextMonth,
    handleDateClick,
    fetchTimetable
  };
}