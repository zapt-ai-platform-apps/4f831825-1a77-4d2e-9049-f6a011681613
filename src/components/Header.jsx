import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function Header({ menuOpen, setMenuOpen }) {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <header className="flex items-center justify-between mb-8 p-4">
      <div className="flex items-center">
        <img
          src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/4f831825-1a77-4d2e-9049-f6a011681613/599b08f5-e3d4-498e-a2a5-687a781d184a.png"
          alt="UpGrade Logo"
          className="w-36 h-24"
        />
      </div>
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
          className="btn btn-destructive py-2 px-6 rounded-full shadow-md transform hover:scale-105 cursor-pointer"
          onClick={signOut}
        >
          Sign Out
        </button>
      </nav>
    </header>
  );
}

export default Header;
