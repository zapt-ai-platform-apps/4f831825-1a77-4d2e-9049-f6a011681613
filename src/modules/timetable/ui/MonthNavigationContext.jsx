import React, { createContext, useContext, useState, useCallback } from 'react';
import { formatDatesWithData, buildSubjectColorMapping, calculateMonthLimits, getOrCreateCurrentMonth } from '../internal/service';

/**
 * Context for sharing month navigation state across components
 */
const MonthNavigationContext = createContext(null);

/**
 * Provider component for month navigation context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 */
export function MonthNavigationProvider({ children }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);

  // Handle previous month navigation
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  }, []);

  // Handle next month navigation
  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  }, []);

  // Method to update month constraints based on preferences and exams
  const updateMonthLimits = useCallback((preferences, exams) => {
    const { minDate: calculatedMinDate, maxDate: calculatedMaxDate } = calculateMonthLimits(preferences, exams);
    setMinDate(calculatedMinDate);
    setMaxDate(calculatedMaxDate);
    setCurrentMonth(prevMonth => getOrCreateCurrentMonth(prevMonth, preferences));
  }, []);

  return (
    <MonthNavigationContext.Provider 
      value={{
        currentMonth,
        setCurrentMonth,
        minDate,
        maxDate,
        handlePrevMonth,
        handleNextMonth,
        updateMonthLimits
      }}
    >
      {children}
    </MonthNavigationContext.Provider>
  );
}

/**
 * Hook for accessing month navigation context
 * @returns {Object} Month navigation context
 */
export function useMonthNavigation() {
  const context = useContext(MonthNavigationContext);
  
  if (context === null) {
    throw new Error('useMonthNavigation must be used within a MonthNavigationProvider');
  }
  
  return context;
}