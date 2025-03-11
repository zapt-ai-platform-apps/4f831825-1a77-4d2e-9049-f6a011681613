import React, { createContext, useContext } from 'react';

/**
 * Context for sharing timetable data between components
 */
const TimetableContext = createContext(null);

/**
 * Provider component for timetable context
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} props.value - Context value
 * @returns {React.ReactElement} Provider component
 */
export function TimetableProvider({ children, value }) {
  // Ensure value always includes a refreshTimetable property, even if it's a no-op
  const finalValue = {
    ...value,
    refreshTimetable: value.refreshTimetable || (() => console.log('refreshTimetable not provided'))
  };
  
  return (
    <TimetableContext.Provider value={finalValue}>
      {children}
    </TimetableContext.Provider>
  );
}

/**
 * Hook for accessing timetable context
 * @returns {Object} Timetable context
 */
export function useTimetableContext() {
  const context = useContext(TimetableContext);
  
  if (context === null) {
    throw new Error('useTimetableContext must be used within a TimetableProvider');
  }
  
  return context;
}