import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import FeatureCard from './FeatureCard';

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 text-center max-w-6xl space-y-8">
        <h1 className="text-4xl sm:text-6xl font-bold font-sans">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            UpGrade
          </span>{' '}
          Your Study Strategy
        </h1>
        
        <p className="text-lg sm:text-xl max-w-2xl mx-auto text-muted-foreground">
          Smart exam preparation powered by AI scheduling. Get personalized revision plans, 
          intelligent reminders, and progress insights - all tailored to your schedule.
        </p>

        <Link
          to="/login"
          className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold 
          shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          Get Started
        </Link>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <FeatureCard 
            title="AI-Powered Scheduling"
            description="Automatically generates optimal revision timetable based on your exams and availability"
          />
          <FeatureCard 
            title="Exam Tracking"
            description="Centralized dashboard to manage all your upcoming exams and key details"
          />
          <FeatureCard 
            title="Customizable Blocks"
            description="Flexible time blocking system that adapts to your daily routine"
          />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;