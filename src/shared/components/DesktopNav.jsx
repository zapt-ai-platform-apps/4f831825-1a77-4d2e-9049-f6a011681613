import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/auth/ui/useAuth';

/**
 * Desktop navigation component
 * @returns {React.ReactElement} Desktop navigation
 */
function DesktopNav() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="hidden md:flex items-center space-x-8">
      <nav className="flex space-x-6">
        <Link
          to="/preferences"
          className={`px-4 py-2 rounded-full transition-all ${
            location.pathname === '/preferences' 
              ? 'bg-primary text-white shadow-lg' 
              : 'hover:bg-primary/20 text-gray-600 hover:text-primary'
          }`}
        >
          ⚙️ Preferences
        </Link>
        <Link
          to="/exams"
          className={`px-4 py-2 rounded-full transition-all ${
            location.pathname === '/exams' 
              ? 'bg-secondary text-white shadow-lg' 
              : 'hover:bg-secondary/20 text-gray-600 hover:text-secondary'
          }`}
        >
          📝 Exams
        </Link>
        <Link
          to="/timetable"
          className={`px-4 py-2 rounded-full transition-all ${
            location.pathname === '/timetable' 
              ? 'bg-accent text-black shadow-lg' 
              : 'hover:bg-accent/20 text-gray-600 hover:text-accent'
          }`}
        >
          🗓️ Timetable
        </Link>
      </nav>
      <button
        onClick={signOut}
        className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
      >
        👋 Sign Out
      </button>
    </div>
  );
}

export default DesktopNav;