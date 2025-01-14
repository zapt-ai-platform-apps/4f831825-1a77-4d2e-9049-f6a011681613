import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import MobileMenu from './MobileMenu';
import { TimetableProvider } from '../contexts/TimetableContext';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/react';

function ProtectedRoute({ children, user, setUser, timetable, setTimetable, exams, setExams, preferences }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Sentry.captureException(error);
    }
  };

  return (
    <TimetableProvider
      value={{
        timetable: timetable,
        setTimetable: setTimetable,
        exams: exams,
        setExams: setExams,
        preferences: preferences,
        currentMonth: currentMonth,
        setCurrentMonth: setCurrentMonth,
      }}
    >
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#004AAD] to-[#5DE0E6] text-white">
        <Header
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          handleSignOut={handleSignOut}
          location={location}
        />
        {menuOpen && (
          <MobileMenu
            setMenuOpen={setMenuOpen}
            handleSignOut={handleSignOut}
            location={location}
          />
        )}
        <main className="flex-grow p-4 flex items-center justify-center">
          {children}
        </main>
      </div>
    </TimetableProvider>
  );
}

export default ProtectedRoute;