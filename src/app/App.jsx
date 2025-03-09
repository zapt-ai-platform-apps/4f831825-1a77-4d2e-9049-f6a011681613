import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../modules/landing/ui/LandingPage';
import Login from '../modules/auth/ui/Login';
import ProtectedRoute from '../modules/auth/ui/ProtectedRoute';
import PreferencesScreen from '../modules/preferences/ui/PreferencesScreen';
import ExamsScreen from '../modules/exams/ui/ExamsScreen';
import TimetableScreen from '../modules/timetable/ui/TimetableScreen';
import ChatWidget from '../modules/support/ui/ChatWidget';
import { useAuth } from '../modules/auth/ui/useAuth';

/**
 * Main application component
 * @returns {React.ReactElement} App component
 */
function App() {
  const { user, loading } = useAuth();

  // Render a simple loading indicator during initial auth check
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/preferences" replace /> : <LandingPage />} />
        <Route path="/login" element={user ? <Navigate to="/preferences" replace /> : <Login />} />
        
        {/* Protected routes */}
        <Route path="/preferences" element={
          <ProtectedRoute>
            <PreferencesScreen />
          </ProtectedRoute>
        } />
        <Route path="/exams" element={
          <ProtectedRoute>
            <ExamsScreen />
          </ProtectedRoute>
        } />
        <Route path="/timetable" element={
          <ProtectedRoute>
            <TimetableScreen />
          </ProtectedRoute>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={user ? <Navigate to="/preferences" replace /> : <LandingPage />} />
      </Routes>
      
      {/* Customer Support Chat Widget - only shown when user is logged in */}
      <ChatWidget />
      
      {/* ZAPT Attribution */}
      <div className="fixed bottom-2 left-2 text-xs text-gray-400 select-none z-50">
        Made on <a href="https://www.zapt.ai" target="_blank" rel="noopener noreferrer" className="underline">ZAPT</a>
      </div>
    </div>
  );
}

export default App;