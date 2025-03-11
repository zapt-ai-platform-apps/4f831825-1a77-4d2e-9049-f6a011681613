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
      <div className="bg-white dark:bg-gray-800 p-6 w-3/4 max-w-xs relative rounded-lg shadow-xl">
        <button
          className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 cursor-pointer"
          onClick={onClose}
          aria-label="Close menu"
        >
          &times;
        </button>
        <nav className="flex flex-col space-y-4">
          <Link
            to="/preferences"
            className={`text-xl text-gray-800 dark:text-gray-200 hover:underline cursor-pointer ${
              location.pathname === '/preferences' ? 'font-bold text-primary dark:text-primary' : ''
            }`}
            onClick={onClose}
          >
            Preferences
          </Link>
          <Link
            to="/exams"
            className={`text-xl text-gray-800 dark:text-gray-200 hover:underline cursor-pointer ${
              location.pathname === '/exams' ? 'font-bold text-secondary dark:text-secondary' : ''
            }`}
            onClick={onClose}
          >
            Exams
          </Link>
          <Link
            to="/timetable"
            className={`text-xl text-gray-800 dark:text-gray-200 hover:underline cursor-pointer ${
              location.pathname === '/timetable' ? 'font-bold text-accent dark:text-accent' : ''
            }`}
            onClick={onClose}
          >
            Timetable
          </Link>
          <button
            className="btn bg-primary dark:bg-primary text-white w-full px-6 py-3 rounded-full transform hover:scale-105 cursor-pointer mt-4"
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