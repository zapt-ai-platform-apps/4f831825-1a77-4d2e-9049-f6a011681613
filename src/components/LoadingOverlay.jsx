import React from 'react';

export default function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white text-black p-6 rounded-lg flex flex-col items-center">
        {/* Simple spinner using tailwind */}
        <div className="loader border-4 border-blue-200 border-t-blue-500 rounded-full w-12 h-12 mb-4 animate-spin"></div>
        <p className="text-center">{message}</p>
      </div>
    </div>
  );
}