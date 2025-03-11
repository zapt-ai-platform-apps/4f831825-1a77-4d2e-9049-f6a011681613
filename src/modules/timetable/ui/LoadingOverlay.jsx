import React from 'react';

/**
 * Loading overlay component
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message
 * @returns {React.ReactElement} Loading overlay
 */
function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-6 rounded-lg flex flex-col items-center">
        <div className="loader border-4 border-blue-200 dark:border-blue-700 border-t-blue-500 rounded-full w-12 h-12 mb-4 animate-spin"></div>
        <p className="text-center">{message}</p>
      </div>
    </div>
  );
}

export default LoadingOverlay;