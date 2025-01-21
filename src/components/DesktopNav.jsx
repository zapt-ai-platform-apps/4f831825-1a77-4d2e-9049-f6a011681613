import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function DesktopNav() {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="hidden md:flex items-center space-x-8">
      <nav className="flex space-x-6">
        <Link
          to="/preferences"
          className={`px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/preferences' 
              ? 'bg-cyan-500/20 text-cyan-400' 
              : 'hover:bg-white/5 text-gray-300 hover:text-white'
          }`}
        >
          Preferences
        </Link>
        <Link
          to="/exams"
          className={`px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/exams' 
              ? 'bg-cyan-500/20 text-cyan-400' 
              : 'hover:bg-white/5 text-gray-300 hover:text-white'
          }`}
        >
          Exams
        </Link>
        <Link
          to="/timetable"
          className={`px-3 py-2 rounded-lg transition-colors ${
            location.pathname === '/timetable' 
              ? 'bg-cyan-500/20 text-cyan-400' 
              : 'hover:bg-white/5 text-gray-300 hover:text-white'
          }`}
        >
          Timetable
        </Link>
      </nav>
      <button
        onClick={signOut}
        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
      >
        Sign Out
      </button>
    </div>
  );
}

export default DesktopNav;