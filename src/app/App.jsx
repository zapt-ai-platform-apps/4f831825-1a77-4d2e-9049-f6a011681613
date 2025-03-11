import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../modules/landing/ui/LandingPage';
import Login from '../modules/auth/ui/Login';
import ProtectedRoute from '../modules/auth/ui/ProtectedRoute';
import PreferencesScreen from '../modules/preferences/ui/PreferencesScreen';
import ExamsScreen from '../modules/exams/ui/ExamsScreen';
import TimetableScreen from '../modules/timetable/ui/TimetableScreen';
import TimetableLogicPage from '../modules/timetable/ui/TimetableLogicPage';
import PrivacyPolicy from '../modules/legal/ui/PrivacyPolicy';
import TermsOfService from '../modules/legal/ui/TermsOfService';
import ChatWidget from '../modules/support/ui/ChatWidget';
import { useAuth } from '../modules/auth/ui/useAuth';
import AppLayout from './AppLayout';

/**
 * Main application component
 * @returns {React.ReactElement} App component
 */
function App() {
  const { user, loading } = useAuth();

  // Render a simple loading indicator during initial auth check
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center dark:bg-gray-900">
        <div className="w-8 h-8 border-4 border-primary dark:border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <AppLayout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={user ? <Navigate to="/preferences" replace /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/preferences" replace /> : <Login />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          
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
          <Route path="/timetable-logic" element={
            <ProtectedRoute>
              <TimetableLogicPage />
            </ProtectedRoute>
          } />
          
          {/* Fallback route */}
          <Route path="*" element={user ? <Navigate to="/preferences" replace /> : <LandingPage />} />
        </Routes>
      </AppLayout>
      
      {/* Customer Support Chat Widget - only shown when user is logged in */}
      <ChatWidget />
      
      {/* ZAPT Attribution */}
      <div className="fixed bottom-2 left-2 text-xs text-gray-400 dark:text-gray-500 select-none z-50">
        Made on <a href="https://www.zapt.ai" target="_blank" rel="noopener noreferrer" className="underline">ZAPT</a>
      </div>
    </div>
  );
}

export default App;