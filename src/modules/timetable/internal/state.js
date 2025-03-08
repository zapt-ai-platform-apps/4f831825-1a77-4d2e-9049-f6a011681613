import { useState, useEffect, useCallback } from 'react';
import { parseISO, format, addMonths, subMonths } from 'date-fns';
import { api as timetableApi } from '../api';
import { api as preferencesApi } from '../../preferences/api';
import { api as examsApi } from '../../exams/api';
import { formatDatesWithData, buildSubjectColorMapping, calculateMonthLimits, getOrCreateCurrentMonth } from './service';
import * as Sentry from '@sentry/browser';

/**
 * Hook for managing timetable state
 * Coordinates fetching of timetable, exams, and preferences data
 * Handles UI state for calendar display
 * 
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

  // Fetch timetable data
  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [timetableData, examsData, preferencesData] = await Promise.all([
        timetableApi.getTimetable(),
        examsApi.getExams(),
        preferencesApi.getPreferences(),
      ]);
      
      console.log("[Timetable] Data fetched successfully", {
        timetableEntries: Object.keys(timetableData).length,
        exams: examsData.length,
        preferences: !!preferencesData
      });
      
      setTimetable(timetableData);
      setExams(examsData);
      setPreferences(preferencesData);
      
      // Format dates with timetable and exam data
      const { datesWithData: formattedDates, subjectsSet } = formatDatesWithData(timetableData, examsData);
      setDatesWithData(formattedDates);
      
      // Build subject color mapping
      const colours = buildSubjectColorMapping(subjectsSet, examsData);
      setSubjectColours(colours);
      
      // Calculate min and max dates for the calendar
      const { minDate: calculatedMinDate, maxDate: calculatedMaxDate } = calculateMonthLimits(preferencesData, examsData);
      setMinDate(calculatedMinDate);
      setMaxDate(calculatedMaxDate);
      
      // Set current month based on preferences or min date
      setCurrentMonth(getOrCreateCurrentMonth(currentMonth, preferencesData));
      
      // If no date is selected, default to today or the min date
      if (!selectedDate) {
        setSelectedDate(new Date());
      }
    } catch (error) {
      console.error('Error fetching timetable data:', error);
      Sentry.captureException(error);
      setError('Failed to load timetable data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentMonth, selectedDate]);
  
  // Fetch data on mount
  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);
  
  // Handle going to previous month
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  }, []);
  
  // Handle going to next month
  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  }, []);
  
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
    setCurrentMonth,
    selectedDate,
    minDate,
    maxDate,
    handlePrevMonth,
    handleNextMonth,
    handleDateClick,
    fetchTimetable
  };
}