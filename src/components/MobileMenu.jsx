import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function MobileMenu({ setMenuOpen, handleSignOut }) {
  const location = useLocation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-3/4 max-w-xs relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          onClick={() => setMenuOpen(false)}
        >
          &times;
        </button>
        <nav className="flex flex-col space-y-4">
          <Link
            to="/preferences"
            className={`text-xl text-blue-600 hover:underline cursor-pointer ${
              location.pathname === '/preferences' ? 'font-bold' : ''
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Preferences
          </Link>
          <Link
            to="/exams"
            className={`text-xl text-blue-600 hover:underline cursor-pointer ${
              location.pathname === '/exams' ? 'font-bold' : ''
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Exams
          </Link>
          <Link
            to="/timetable"
            className={`text-xl text-blue-600 hover:underline cursor-pointer ${
              location.pathname === '/timetable' ? 'font-bold' : ''
            }`}
            onClick={() => setMenuOpen(false)}
          >
            Timetable
          </Link>
          <button
            className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            onClick={() => {
              handleSignOut();
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