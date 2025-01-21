import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import FeatureCard from './FeatureCard';
import StatsSection from './StatsSection';

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-900 to-purple-800 text-white relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 text-center max-w-6xl">
        <h1 className="text-4xl sm:text-6xl font-bold mb-6 font-sans">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            UpGrade
          </span>{' '}
          Your Study Success
        </h1>
        <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto text-gray-200">
          Transform your exam preparation with AI-powered scheduling that adapts to your life.
          Get personalized revision plans, smart reminders, and progress tracking - all in one place.
        </p>

        <Link
          to="/login"
          className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold 
          shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform cursor-pointer"
        >
          Start Free Trial
        </Link>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {['Smart Scheduling', 'Progress Tracking', 'Cross-Device Sync'].map((feature, idx) => (
            <FeatureCard key={idx} title={feature} />
          ))}
        </div>

        <StatsSection />
      </div>
    </div>
  );
}

export default LandingPage;