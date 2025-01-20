import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import MobileMenu from './MobileMenu';
import { TimetableProvider } from '../contexts/TimetableContext';

function ProtectedRoute({
  children,
  user,
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
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#004AAD] to-[#5DE0E6] text-white">
        <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} location={location} />
        {menuOpen && (
          <MobileMenu setMenuOpen={setMenuOpen} location={location} />
        )}
        <main className="flex-grow flex items-center justify-center h-full">
          {children}
        </main>
      </div>
    </TimetableProvider>
  );
}

export default ProtectedRoute;