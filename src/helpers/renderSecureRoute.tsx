import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../components/Login';

interface SecureRouteProps {
  user: any;
  setUser: (user: any) => void;
  timetable: any;
  setTimetable: (timetable: any) => void;
  exams: any[];
  setExams: (exams: any[]) => void;
  preferences: any;
  refetchExams: () => void;
  Component: React.ComponentType;
}

const renderSecureRoute = ({
  user,
  setUser,
  timetable,
  setTimetable,
  exams,
  setExams,
  preferences,
  refetchExams,
  Component
}: SecureRouteProps) => {
  return user ? (
    <ProtectedRoute
      user={user}
      setUser={setUser}
      timetable={timetable}
      setTimetable={setTimetable}
      exams={exams}
      setExams={setExams}
      preferences={preferences}
      refetchExams={refetchExams}
    >
      <Component />
    </ProtectedRoute>
  ) : (
    <Login />
  );
};

export default renderSecureRoute;