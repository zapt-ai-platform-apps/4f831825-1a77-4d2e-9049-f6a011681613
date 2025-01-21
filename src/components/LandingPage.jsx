import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedBackground from './AnimatedBackground';
import FeatureCard from './FeatureCard';
import EmojiFloats from './EmojiFloats';

function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground relative overflow-hidden">
      <AnimatedBackground />
      <EmojiFloats />

      <div className="relative z-10 text-center max-w-6xl space-y-8">
        <h1 className="text-4xl sm:text-6xl font-bold">
          <span className="gradient-text">UpGrade</span> Your Study Game 🚀
        </h1>
        
        <p className="text-lg sm:text-xl max-w-2xl mx-auto text-muted-foreground">
          Turn exam stress into success with our smart planner! Get personalized schedules
        </p>

        <Link
          to="/login"
          className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold 
          fun-shadow hover-scale transition-all duration-300"
        >
          Let's Get Started! 🎯
        </Link>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <FeatureCard 
            emoji="🤖"
            title="AI-Powered Magic"
            description="Smart schedules that adapt to your life ⚡"
          />
          <FeatureCard 
            emoji="📅"
            title="Exam Tracker"
            description="Never miss a test date 🚨"
          />
        </div>
      </div>
    </div>
  );
}

export default LandingPage;