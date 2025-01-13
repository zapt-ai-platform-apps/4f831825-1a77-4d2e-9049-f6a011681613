import React, { createContext, useContext } from 'react';

const TimetableContext = createContext();

export function TimetableProvider({ children, value }) {
  return (
    <TimetableContext.Provider value={value}>
      {children}
    </TimetableContext.Provider>
  );
}

export function useTimetable() {
  return useContext(TimetableContext);
}