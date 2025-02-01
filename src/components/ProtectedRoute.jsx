import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import MobileMenu from './MobileMenu';
import { TimetableProvider } from '../contexts/TimetableContext';

function ProtectedRoute({
  children,
  user,
  setUser,
  timetable,
  setTimetable,
  exams,
  setExams,
  preferences,
  refetchExams
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(null);
  const location = useLocation();
  const isTimetable = location && location.pathname === '/timetable';

  return (
    <TimetableProvider
      value={{
        timetable,
        setTimetable,
        exams,
        setExams,
        preferences,
        refetchExams,
        currentMonth,
        setCurrentMonth
      }}
    >
      <div className={`flex flex-col min-h-screen bg-background text-white ${isTimetable ? 'pt-8' : 'pt-16'}`}>
        <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} location={location} />
        {menuOpen && (
          <MobileMenu setMenuOpen={setMenuOpen} location={location} />
        )}
        <main className="flex-grow flex items-center justify-center h-full pt-4">
          {children}
        </main>
      </div>
    </TimetableProvider>
  );
}

export default ProtectedRoute;