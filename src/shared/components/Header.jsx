import React from 'react';
import { useLocation } from 'react-router-dom';
import Logo from './Logo';
import DesktopNav from './DesktopNav';
import MonthNavigation from '../../modules/timetable/ui/MonthNavigation';
import { useMonthNavigation } from '../../modules/timetable/ui/MonthNavigationContext';
import { useAuth } from '../../modules/auth/ui/useAuth';
import ThemeToggle from '../../modules/core/ui/ThemeToggle';

/**
 * Header component with navigation
 * @param {Object} props - Component props
 * @param {boolean} props.menuOpen - Whether mobile menu is open
 * @param {Function} props.setMenuOpen - Function to set menu open state
 * @returns {React.ReactElement} Header component
 */
function Header({ menuOpen, setMenuOpen }) {
  const location = useLocation();
  const isTimetable = location.pathname === '/timetable';
  const { user } = useAuth();
  
  // Only try to access month navigation context when on the timetable page
  let monthNavProps = {};
  if (isTimetable) {
    try {
      const { currentMonth, handlePrevMonth, handleNextMonth, minDate, maxDate } = useMonthNavigation();
      monthNavProps = { currentMonth, onPrevMonth: handlePrevMonth, onNextMonth: handleNextMonth, minDate, maxDate };
    } catch (error) {
      console.error("Error accessing month navigation context:", error);
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 fixed w-full top-0 z-50 shadow-sm">
      <div className="flex items-center space-x-4">
        <Logo />
      </div>
      
      {/* Month navigation in the middle for timetable page */}
      {isTimetable && user && monthNavProps.currentMonth && (
        <div className="flex-1 flex justify-center">
          <MonthNavigation {...monthNavProps} />
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        {/* Theme toggle */}
        <ThemeToggle />
        
        {/* Only show navigation when user is logged in */}
        {user && <DesktopNav />}
        
        {/* Only show mobile menu toggle when user is logged in */}
        {user && (
          <button
            className="md:hidden text-gray-600 dark:text-gray-300 cursor-pointer"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;