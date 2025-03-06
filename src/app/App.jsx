import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../modules/landing/ui/LandingPage';
import Login from '../modules/auth/ui/Login';
import ProtectedRoute from '../modules/auth/ui/ProtectedRoute';
import PreferencesScreen from '../modules/preferences/ui/PreferencesScreen';
import ExamsScreen from '../modules/exams/ui/ExamsScreen';
import TimetableScreen from '../modules/timetable/ui/TimetableScreen';
import { useAuth } from '../modules/auth/ui/useAuth';

/**
 * Main application component
 * @returns {React.ReactElement} App component
 */
function App() {
  return (
    <div className="h-full">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
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
        <Route path="*" element={<LandingPage />} />
      </Routes>
      
      {/* ZAPT Attribution */}
      <div className="fixed bottom-2 right-2 text-xs text-gray-400 select-none z-50">
        Made on <a href="https://www.zapt.ai" target="_blank" rel="noopener noreferrer" className="underline">ZAPT</a>
      </div>
    </div>
  );
}

export default App;