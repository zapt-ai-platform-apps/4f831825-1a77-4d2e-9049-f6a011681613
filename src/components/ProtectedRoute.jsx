import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import MobileMenu from './MobileMenu';
import Footer from './Footer';
import { TimetableProvider } from '../contexts/TimetableContext';

function ProtectedRoute({ children, ...props }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await props.setUser(null);
    navigate('/login');
  };

  return (
    <TimetableProvider
      value={{
        timetable: props.timetable,
        setTimetable: props.setTimetable,
        exams: props.exams,
        setExams: props.setExams,
        preferences: props.preferences,
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
        <Footer />
      </div>
    </TimetableProvider>
  );
}

export default ProtectedRoute;