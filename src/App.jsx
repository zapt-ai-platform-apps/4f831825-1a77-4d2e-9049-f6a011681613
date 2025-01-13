import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Preferences from './components/Preferences';
import Exams from './components/Exams';
import Timetable from './components/Timetable';
import ProtectedRoute from './components/ProtectedRoute';
import useAuth from './hooks/useAuth';
import useData from './hooks/useData';
import Footer from './components/Footer';

function App() {
  const { user, setUser } = useAuth();
  const { timetable, exams, preferences } = useData(user);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/preferences"
          element={
            user ? (
              <ProtectedRoute
                user={user}
                setUser={setUser}
                timetable={timetable}
                exams={exams}
                preferences={preferences}
              >
                <Preferences />
              </ProtectedRoute>
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/exams"
          element={
            user ? (
              <ProtectedRoute
                user={user}
                setUser={setUser}
                timetable={timetable}
                exams={exams}
                preferences={preferences}
              >
                <Exams />
              </ProtectedRoute>
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/timetable"
          element={
            user ? (
              <ProtectedRoute
                user={user}
                setUser={setUser}
                timetable={timetable}
                exams={exams}
                preferences={preferences}
              >
                <Timetable />
              </ProtectedRoute>
            ) : (
              <Login />
            )
          }
        />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;