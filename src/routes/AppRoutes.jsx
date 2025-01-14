import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../components/LandingPage';
import Login from '../components/Login';
import Preferences from '../components/Preferences';
import Exams from '../components/Exams';
import Timetable from '../components/Timetable';
import ProtectedRoute from '../components/ProtectedRoute';

function AppRoutes({
  user,
  setUser,
  timetable,
  setTimetable,
  exams,
  setExams,
  preferences,
  currentMonth,
  setCurrentMonth,
}) {
  return (
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
              setTimetable={setTimetable}
              exams={exams}
              setExams={setExams}
              preferences={preferences}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
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
              setTimetable={setTimetable}
              exams={exams}
              setExams={setExams}
              preferences={preferences}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
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
              setTimetable={setTimetable}
              exams={exams}
              setExams={setExams}
              preferences={preferences}
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
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
  );
}

export default AppRoutes;