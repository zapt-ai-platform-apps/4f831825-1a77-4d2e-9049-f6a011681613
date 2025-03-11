import React from 'react';
import { useTheme } from './ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme}
      className="cursor-pointer p-2 rounded-full transition-colors duration-300 
        hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-primary dark:focus:ring-primary dark:focus:ring-offset-gray-800"
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <FiSun className="h-5 w-5 text-yellow-300" />
      ) : (
        <FiMoon className="h-5 w-5 text-gray-600" />
      )}
    </button>
  );
}

export default ThemeToggle;