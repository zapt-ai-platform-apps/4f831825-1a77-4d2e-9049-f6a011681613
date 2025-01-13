import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header({ menuOpen, setMenuOpen, handleSignOut }) {
  const location = useLocation();

  return (
    <header className="flex items-center justify-between mb-8 p-4">
      <h1 className="text-4xl font-handwriting font-bold">
        <span className="text-yellow-500">UpGrade</span>
      </h1>
      <div className="sm:hidden">
        <button
          className="text-white cursor-pointer focus:outline-none"
          onClick={() => setMenuOpen(true)}
        >
          &#9776;
        </button>
      </div>
      <nav className="hidden sm:flex space-x-4">
        <Link
          to="/preferences"
          className={`hover:underline cursor-pointer ${
            location.pathname === '/preferences' ? 'font-bold' : ''
          }`}
        >
          Preferences
        </Link>
        <Link
          to="/exams"
          className={`hover:underline cursor-pointer ${
            location.pathname === '/exams' ? 'font-bold' : ''
          }`}
        >
          Exams
        </Link>
        <Link
          to="/timetable"
          className={`hover:underline cursor-pointer ${
            location.pathname === '/timetable' ? 'font-bold' : ''
          }`}
        >
          Timetable
        </Link>
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
          onClick={handleSignOut}
        >
          Sign Out
        </button>
      </nav>
    </header>
  );
}

export default Header;