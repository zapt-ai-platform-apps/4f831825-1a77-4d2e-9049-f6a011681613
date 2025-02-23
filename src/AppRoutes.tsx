import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Preferences from './components/Preferences';
import Exams from './components/Exams';
import Timetable from './components/Timetable';
import renderSecureRoute from './helpers/renderSecureRoute';

interface AppRoutesProps {
  user: any;
  setUser: (user: any) => void;
  timetable: any;
  setTimetable: (timetable: any) => void;
  exams: any[];
  setExams: (exams: any[]) => void;
  preferences: any;
  refetchExams: () => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({
  user,
  setUser,
  timetable,
  setTimetable,
  exams,
  setExams,
  preferences,
  refetchExams
}) => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/preferences"
        element={renderSecureRoute({
          user,
          setUser,
          timetable,
          setTimetable,
          exams,
          setExams,
          preferences,
          refetchExams,
          Component: Preferences
        })}
      />
      <Route
        path="/exams"
        element={renderSecureRoute({
          user,
          setUser,
          timetable,
          setTimetable,
          exams,
          setExams,
          preferences,
          refetchExams,
          Component: Exams
        })}
      />
      <Route
        path="/timetable"
        element={renderSecureRoute({
          user,
          setUser,
          timetable,
          setTimetable,
          exams,
          setExams,
          preferences,
          refetchExams,
          Component: Timetable
        })}
      />
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

export default AppRoutes;