import React from 'react';
import AppRoutes from './AppRoutes';
import useAuth from './hooks/useAuth';
import useData from './hooks/useData';

function App() {
  const { user, setUser } = useAuth();
  const { timetable, setTimetable, exams, setExams, preferences } = useData(user);

  return (
    <div className="min-h-screen">
      <AppRoutes
        user={user}
        setUser={setUser}
        timetable={timetable}
        setTimetable={setTimetable}
        exams={exams}
        setExams={setExams}
        preferences={preferences}
      />
    </div>
  );
}

export default App;