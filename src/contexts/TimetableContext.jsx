import { createContext, useContext } from 'solid-js';

const TimetableContext = createContext();

export function TimetableProvider(props) {
  return (
    <TimetableContext.Provider value={props.value}>
      {props.children}
    </TimetableContext.Provider>
  );
}

export function useTimetable() {
  return useContext(TimetableContext);
}