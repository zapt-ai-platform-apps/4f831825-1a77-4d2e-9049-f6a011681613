import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function MobileMenu({ setMenuOpen }) {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background p-6 w-3/4 max-w-xs relative rounded-lg shadow-xl backdrop-blur-md">
        <button
          className="absolute top-2 right-2 text-white hover:text-gray-300 cursor-pointer"
          onClick={() => setMenuOpen(false)}
        >
          &times;
        </button>
        <nav className="flex flex-col space-y-4">
          <Link
            to="/preferences"
            className={`text-xl text-white hover:underline cursor-pointer ${
              location.pathname === '/preferences' ? 'font-bold' : ''
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Preferences
          </Link>
          <Link
            to="/exams"
            className={`text-xl text-white hover:underline cursor-pointer ${
              location.pathname === '/exams' ? 'font-bold' : ''
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Exams
          </Link>
          <Link
            to="/timetable"
            className={`text-xl text-white hover:underline cursor-pointer ${
              location.pathname === '/timetable' ? 'font-bold' : ''
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Timetable
          </Link>
          <button
            className="btn btn-destructive w-full px-6 py-3 transform hover:scale-105 cursor-pointer mt-4"
            onClick={() => {
              signOut();
              setMenuOpen(false);
            }}
          >
            Sign Out
          </button>
        </nav>
      </div>
    </div>
  );
}

export default MobileMenu;