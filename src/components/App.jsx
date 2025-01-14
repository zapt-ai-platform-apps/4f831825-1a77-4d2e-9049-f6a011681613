import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes';
import Footer from './Footer';
import useAuth from '../hooks/useAuth';
import useData from '../hooks/useData';

function App() {
  const { user, setUser } = useAuth();
  const { timetable, exams, preferences, setTimetable, setExams } = useData(user);
  const [currentMonth, setCurrentMonth] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
      />
      <Footer />
    </div>
  );
}

export default App;