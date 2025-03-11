import React, { createContext, useContext } from 'react';

const TimetableContext = createContext({
  datesWithData: {},
  subjectColours: {},
  preferences: null,
  refreshTimetable: () => {}
});

export const TimetableProvider = ({ children, value }) => {
  return (
    <TimetableContext.Provider value={value}>
      {children}
    </TimetableContext.Provider>
  );
};

export const useTimetableContext = () => {
  const context = useContext(TimetableContext);
  if (!context) {
    throw new Error('useTimetableContext must be used within a TimetableProvider');
  }
  return context;
};