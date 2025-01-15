import React from 'react';
import AppRoutes from './AppRoutes';
import Footer from './components/Footer';
import useAuth from './hooks/useAuth';
import useData from './hooks/useData';

function App() {
  const { user } = useAuth();
  // Include refetchExams in the destructuring so we can pass it down
  const { timetable, setTimetable, exams, setExams, preferences, refetchExams } = useData(user);

  return (
    <div className="min-h-screen">
      <AppRoutes
        user={user}
        timetable={timetable}
        setTimetable={setTimetable}
        exams={exams}
        setExams={setExams}
        preferences={preferences}
        refetchExams={refetchExams}
      />
      <Footer />
    </div>
  );
}

export default App;