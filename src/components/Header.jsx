import React from 'react';
import { useLocation } from 'react-router-dom';
import Logo from './Logo';
import DesktopNav from './DesktopNav';
import MonthNavigation from './Timetable/MonthNavigation';
import { useTimetable } from '../contexts/TimetableContext';

function Header({ menuOpen, setMenuOpen }) {
  const location = useLocation();
  const { currentMonth, setCurrentMonth } = useTimetable();

  const handlePrevMonth = () => {
    if (currentMonth) {
      const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
      setCurrentMonth(newMonth);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth) {
      const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
      setCurrentMonth(newMonth);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-2 bg-background/80 backdrop-blur-md border-b border-white/10 fixed w-full top-0 z-50">
      <div className="flex items-center space-x-4">
        <Logo />
        {currentMonth && (
          <MonthNavigation
            currentMonth={currentMonth}
            handlePrevMonth={handlePrevMonth}
            handleNextMonth={handleNextMonth}
          />
        )}
      </div>
      <DesktopNav />
      <button
        className="md:hidden text-white cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
    </header>
  );
}

export default Header;