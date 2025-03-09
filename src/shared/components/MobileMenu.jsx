import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../modules/auth/ui/useAuth';

/**
 * Mobile menu component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the menu is open
 * @param {Function} props.onClose - Function to close the menu
 * @returns {React.ReactElement} Mobile menu
 */
function MobileMenu({ isOpen, onClose }) {
  const location = useLocation();
  const { signOut } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background p-6 w-3/4 max-w-xs relative rounded-lg shadow-xl backdrop-blur-md">
        <button
          className="absolute top-2 right-2 text-white hover:text-gray-300 cursor-pointer"
          onClick={onClose}
          aria-label="Close menu"
        >
          &times;
        </button>
        <nav className="flex flex-col space-y-4">
          <Link
            to="/preferences"
            className={`text-xl text-white hover:underline cursor-pointer ${
              location.pathname === '/preferences' ? 'font-bold' : ''
            }`}
            onClick={onClose}
          >
            Preferences
          </Link>
          <Link
            to="/exams"
            className={`text-xl text-white hover:underline cursor-pointer ${
              location.pathname === '/exams' ? 'font-bold' : ''
            }`}
            onClick={onClose}
          >
            Exams
          </Link>
          <Link
            to="/timetable"
            className={`text-xl text-white hover:underline cursor-pointer ${
              location.pathname === '/timetable' ? 'font-bold' : ''
            }`}
            onClick={onClose}
          >
            Timetable
          </Link>
          <button
            className="btn btn-destructive w-full px-6 py-3 transform hover:scale-105 cursor-pointer mt-4"
            onClick={() => {
              signOut();
              onClose();
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