import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#004AAD] to-[#5DE0E6] text-white">
      <h1 className="text-3xl sm:text-5xl font-handwriting font-bold mb-6 text-center">
        Welcome to <span className="text-yellow-500">UpGrade</span>
      </h1>
      <p className="text-lg sm:text-xl mb-8 text-center max-w-2xl">
        UpGrade is a personalized revision timetable app designed to help you efficiently prepare for your examinations. Get started now to create your custom study schedule!
      </p>
      <Link
        to="/login"
        className="px-8 py-4 bg-white text-[#004AAD] rounded-full shadow-lg hover:bg-opacity-90 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
      >
        Get Started
      </Link>
    </div>
  );
}

export default LandingPage;