import { useState, useEffect } from 'react';
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
  
  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
    
    // Set up listeners for data updates
    const examSubscription = eventBus.subscribe('exams/updated', () => {
      fetchExams();
    });
    
    const timetableSubscription = eventBus.subscribe(events.UPDATED, () => {
      fetchTimetable();
    });
    
    const preferencesSubscription = eventBus.subscribe('preferences/updated', () => {
      fetchPreferences();
    });
    
    return () => {
      examSubscription();
      timetableSubscription();
      preferencesSubscription();
    };
  }, []);
  
  // Update derived state when primary data changes
  useEffect(() => {
    if (!loading) {
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
    }
  }, [timetable, exams, preferences, loading]);
  
  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchTimetable(), fetchExams(), fetchPreferences()]);
    } catch (error) {
      console.error('Error fetching timetable data:', error);
      Sentry.captureException(error);
      setError('Failed to load timetable data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch timetable
  const fetchTimetable = async () => {
    try {
      const data = await timetableApi.getTimetable();
      setTimetable(data);
      eventBus.publish(events.LOADED, { timetable: data });
      return data;
    } catch (error) {
      console.error('Error fetching timetable:', error);
      Sentry.captureException(error);
      eventBus.publish(events.ERROR, { error: error.message });
      throw error;
    }
  };
  
  // Fetch exams
  const fetchExams = async () => {
    try {
      const data = await examsApi.getExams();
      setExams(data);
      return data;
    } catch (error) {
      console.error('Error fetching exams:', error);
      Sentry.captureException(error);
      throw error;
    }
  };
  
  // Fetch preferences
  const fetchPreferences = async () => {
    try {
      const data = await preferencesApi.getPreferences();
      setPreferences(data);
      return data;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      Sentry.captureException(error);
      throw error;
    }
  };
  
  // Handle previous month
  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      if (!prev) return prev;
      
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      
      if (minDate && newMonth < minDate) {
        return prev;
      }
      
      return newMonth;
    });
    setSelectedDate(null);
  };
  
  // Handle next month
  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      if (!prev) return prev;
      
      const newMonth = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      
      return newMonth;
    });
    setSelectedDate(null);
  };
  
  // Handle date click
  const handleDateClick = (date) => {
    if (selectedDate && isSameDay(selectedDate, date)) {
      setSelectedDate(null);
    } else {
      setSelectedDate(date);
    }
  };
  
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