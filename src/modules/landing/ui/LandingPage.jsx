import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiCalendar, FiCheckSquare, FiClock, FiSliders, FiStar, FiBookOpen } from 'react-icons/fi';
import AnimatedBackground from './AnimatedBackground';
import FeatureCard from './FeatureCard';
import { useAuth } from '../../auth/ui/useAuth';
import TimetableMockup from './TimetableMockup';

/**
 * Landing page component
 * @returns {React.ReactElement} Landing page
 */
function LandingPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect to preferences if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/preferences', { replace: true });
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 md:px-12 max-w-7xl mx-auto z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              <span className="gradient-text">Ace Your Exams</span> With Smart Revision Planning
            </h1>
            
            <p className="text-lg sm:text-xl mb-8 text-gray-600 dark:text-gray-300 max-w-lg mx-auto md:mx-0">
              UpGrade creates personalized study timetables that adapt to your exam schedule, 
              learning preferences, and available time.
            </p>

            <Link
              to="/login"
              className="inline-block bg-primary text-primary-foreground px-8 py-4 rounded-full text-lg font-semibold cursor-pointer 
              fun-shadow hover-scale transition-all duration-300"
            >
              Create Your Plan Today! 🚀
            </Link>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <TimetableMockup />
          </div>
        </div>
      </section>
      
      {/* Key Features Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto z-10 relative">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Everything You Need to <span className="gradient-text">Excel</span>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<FiSliders className="text-primary" />}
            title="Personalized Preferences"
            description="Set your available study times, preferred learning blocks, and revision start date to match your lifestyle."
          />
          <FeatureCard 
            icon={<FiCheckSquare className="text-primary" />}
            title="Exam Management"
            description="Add your upcoming exams with details like subject, date, and time to ensure perfect preparation."
          />
          <FeatureCard 
            icon={<FiCalendar className="text-primary" />}
            title="Dynamic Timetable"
            description="Get an interactive calendar view of your personalized revision schedule optimized for your learning."
          />
          <FeatureCard 
            icon={<FiClock className="text-primary" />}
            title="Smart Time Allocation"
            description="Our algorithm prioritizes subjects based on exam dates and your learning preferences."
          />
          <FeatureCard 
            icon={<FiStar className="text-primary" />}
            title="Blocked Time Management"
            description="Add time blocks for extracurricular activities or personal commitments that you can't study during."
          />
          <FeatureCard 
            icon={<FiBookOpen className="text-primary" />}
            title="Subject-Focused Sessions"
            description="Balanced study sessions that ensure every subject gets appropriate attention before exams."
          />
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 px-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg z-10 relative">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Simple Steps to <span className="gradient-text">Success</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 rounded-xl border border-primary/20 bg-white dark:bg-gray-700 shadow-sm">
              <div className="w-16 h-16 flex items-center justify-center text-2xl bg-primary/10 text-primary rounded-full mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Set Your Preferences</h3>
              <p className="text-gray-600 dark:text-gray-300">Enter your available days, study time preferences, and revision start date.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl border border-primary/20 bg-white dark:bg-gray-700 shadow-sm">
              <div className="w-16 h-16 flex items-center justify-center text-2xl bg-primary/10 text-primary rounded-full mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Add Your Exams</h3>
              <p className="text-gray-600 dark:text-gray-300">Input details about your upcoming exams including subjects, dates, and time of day.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl border border-primary/20 bg-white dark:bg-gray-700 shadow-sm">
              <div className="w-16 h-16 flex items-center justify-center text-2xl bg-primary/10 text-primary rounded-full mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-2 dark:text-white">Generate & Use Timetable</h3>
              <p className="text-gray-600 dark:text-gray-300">Get your personalized study plan and start revising with confidence.</p>
            </div>
          </div>
          
          <div className="text-center">
            <Link
              to="/login"
              className="inline-block bg-accent text-accent-foreground px-8 py-4 rounded-full text-lg font-semibold cursor-pointer 
              shadow-lg hover-scale transition-all duration-300"
            >
              Start Building Your Plan 📝
            </Link>
          </div>
        </div>
      </section>
      
      {/* Testimonial / Quote Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto z-10 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-6">💬</div>
          <blockquote className="text-xl md:text-2xl italic mb-6 text-gray-700 dark:text-gray-300">
            "The smart study planner helped me organize my revision efficiently. 
            I went from feeling overwhelmed to confident and prepared for all my exams!"
          </blockquote>
          <p className="font-semibold text-primary">- Happy Student</p>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 z-10 relative">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 dark:text-white">
            Ready to Transform Your Study Routine?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto dark:text-gray-300">
            Join students who are using UpGrade to achieve better results with less stress.
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary text-primary-foreground px-10 py-4 rounded-full text-lg font-semibold cursor-pointer 
            fun-shadow hover-scale transition-all duration-300"
          >
            Get Started Now ✨
          </Link>
        </div>
      </section>
      
      {/* Footer links section */}
      <section className="py-8 px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p className="mb-4">© {new Date().getFullYear()} UpGrade - Empowering students to reach their potential</p>
          <p>
            <Link to="/privacy-policy" className="text-primary hover:underline mx-2">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-primary hover:underline mx-2">Terms of Service</Link>
            <a href="mailto:support@zapt.ai" className="text-primary hover:underline mx-2">Contact Us</a>
          </p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;