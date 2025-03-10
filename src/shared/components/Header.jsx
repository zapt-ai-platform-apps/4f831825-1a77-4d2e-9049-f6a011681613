import React from 'react';
import { useLocation } from 'react-router-dom';
import Logo from './Logo';
import DesktopNav from './DesktopNav';
import MonthNavigation from '../../modules/timetable/ui/MonthNavigation';
import { useMonthNavigation } from '../../modules/timetable/ui/MonthNavigationContext';
import { useAuth } from '../../modules/auth/ui/useAuth';

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
    <header className="flex items-center justify-between px-6 py-2 bg-background/80 backdrop-blur-md border-b border-white/10 fixed w-full top-0 z-50">
      <div className="flex items-center space-x-4">
        <Logo />
      </div>
      
      {/* Month navigation in the middle for timetable page */}
      {isTimetable && user && monthNavProps.currentMonth && (
        <div className="flex-1 flex justify-center">
          <MonthNavigation {...monthNavProps} />
        </div>
      )}
      
      {/* Only show navigation when user is logged in */}
      {user && <DesktopNav />}
      
      {/* Only show mobile menu toggle when user is logged in */}
      {user && (
        <button
          className="md:hidden text-white cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      )}
    </header>
  );
}

export default Header;