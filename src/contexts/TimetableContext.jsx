import { createContext, useContext, createSignal } from 'solid-js';

const TimetableContext = createContext();

export function TimetableProvider(props) {
  const [currentMonth, setCurrentMonth] = createSignal(null);

  const value = {
    ...props.value,
    currentMonth,
    setCurrentMonth,
  };

  return (
    <TimetableContext.Provider value={value}>
      {props.children}
    </TimetableContext.Provider>
  );
}

export function useTimetable() {
  return useContext(TimetableContext);
}