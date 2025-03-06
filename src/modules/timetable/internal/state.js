import { useState, useEffect, useCallback } from 'react';
import { api as timetableApi } from '../api';
import { api as examsApi } from '../../exams/api';
import { api as preferencesApi } from '../../preferences/api';
import { formatDatesWithData, buildSubjectColorMapping, calculateMonthLimits, getOrCreateCurrentMonth } from './service';
import { eventBus } from '../../core/events';
import { events } from '../events';
import * as Sentry from '@sentry/browser';
import { isSameDay } from 'date-fns';

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
  const [currentMonth, setCurrentMonth] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  
  // Fetch timetable - use useCallback to ensure the function reference is stable
  const fetchTimetable = useCallback(async () => {
    try {
      console.log("Fetching timetable data...");
      const data = await timetableApi.getTimetable();
      console.log("Timetable data received:", data);
      setTimetable(data);
      eventBus.publish(events.LOADED, { timetable: data });
      return data;
    } catch (error) {
      console.error('Error fetching timetable:', error);
      Sentry.captureException(error);
      eventBus.publish(events.ERROR, { error: error.message });
      throw error;
    }
  }, []);
  
  // Fetch exams
  const fetchExams = useCallback(async () => {
    try {
      console.log("Fetching exams data...");
      const data = await examsApi.getExams();
      console.log("Exams data received:", data?.length || 0, "exams");
      setExams(data);
      return data;
    } catch (error) {
      console.error('Error fetching exams:', error);
      Sentry.captureException(error);
      throw error;
    }
  }, []);
  
  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    try {
      console.log("Fetching preferences data...");
      const data = await preferencesApi.getPreferences();
      console.log("Preferences data received:", data ? "preferences found" : "no preferences");
      setPreferences(data);
      return data;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      Sentry.captureException(error);
      throw error;
    }
  }, []);
  
  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching all timetable data...");
      const [timetableData, examsData, preferencesData] = await Promise.all([
        fetchTimetable(),
        fetchExams(),
        fetchPreferences()
      ]);
      console.log("All timetable data fetched successfully");
      return { timetableData, examsData, preferencesData };
    } catch (error) {
      console.error('Error fetching timetable data:', error);
      Sentry.captureException(error);
      setError('Failed to load timetable data. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchTimetable, fetchExams, fetchPreferences]);
  
  // Fetch data on mount
  useEffect(() => {
    console.log("Timetable state initialized, fetching initial data...");
    fetchAllData();
    
    // Set up listeners for data updates
    const examSubscription = eventBus.subscribe('exams/updated', () => {
      console.log("Exam update event received, refreshing exams...");
      fetchExams();
    });
    
    const timetableSubscription = eventBus.subscribe(events.UPDATED, () => {
      console.log("Timetable update event received, refreshing timetable...");
      fetchTimetable();
    });
    
    const preferencesSubscription = eventBus.subscribe('preferences/updated', () => {
      console.log("Preferences update event received, refreshing preferences...");
      fetchPreferences();
    });
    
    return () => {
      examSubscription();
      timetableSubscription();
      preferencesSubscription();
    };
  }, [fetchAllData, fetchExams, fetchTimetable, fetchPreferences]);
  
  // Update derived state when primary data changes
  useEffect(() => {
    if (!loading) {
      console.log("Updating derived timetable state...");
      
      // Format dates with data
      const { datesWithData: formattedDates, subjectsSet } = formatDatesWithData(timetable, exams);
      setDatesWithData(formattedDates);
      
      // Build subject colors
      const colors = buildSubjectColorMapping(subjectsSet, exams);
      setSubjectColours(colors);
      
      // Calculate month limits
      const { minDate: calculatedMinDate, maxDate: calculatedMaxDate } = calculateMonthLimits(preferences, exams);
      setMinDate(calculatedMinDate);
      setMaxDate(calculatedMaxDate);
      
      // Set current month if not already set
      setCurrentMonth(current => getOrCreateCurrentMonth(current, preferences));
      
      console.log("Derived timetable state updated successfully");
    }
  }, [timetable, exams, preferences, loading]);
  
  // Handle previous month
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (!prev) return prev;
      
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      
      if (minDate) {
        // Compare by year and month, not by exact date
        // This allows navigation to the month of the start date
        const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        if (newMonth < minMonth) {
          return prev;
        }
      }
      
      return newMonth;
    });
    setSelectedDate(null);
  }, [minDate]);
  
  // Handle next month
  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      if (!prev) return prev;
      
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      
      return newMonth;
    });
    setSelectedDate(null);
  }, []);
  
  // Handle date click
  const handleDateClick = useCallback((date) => {
    if (selectedDate && isSameDay(selectedDate, date)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  }, [selectedDate]);
  
  return {
    timetable,
    exams,
    preferences,
    loading,
    error,
    datesWithData,
    subjectColours,
    currentMonth,
    setCurrentMonth,
    selectedDate,
    minDate,
    maxDate,
    fetchAllData,
    fetchTimetable,
    fetchExams,
    fetchPreferences,
    handlePrevMonth,
    handleNextMonth,
    handleDateClick
  };
}