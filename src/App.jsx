import React from 'react';
import AppRoutes from './AppRoutes';
import Footer from './components/Footer';
import useAuth from './hooks/useAuth';
import useData from './hooks/useData';

function App() {
  const { user } = useAuth();
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
      <div className="fixed bottom-2 right-2 text-xs text-gray-400 select-none z-50">
        Made on <a href="https://www.zapt.ai" target="_blank" rel="noopener noreferrer" className="underline">ZAPT</a>
      </div>
    </div>
  );
}

export default App;