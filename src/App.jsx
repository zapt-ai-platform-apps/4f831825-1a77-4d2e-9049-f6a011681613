import { createSignal, onMount, createEffect } from 'solid-js';
import { supabase } from './supabaseClient';
import { Routes, Route, useNavigate, useLocation } from '@solidjs/router';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Preferences from './components/Preferences';
import Exams from './components/Exams';
import Timetable from './components/Timetable';
import ProtectedRoute from './components/ProtectedRoute';
import { fetchTimetable, fetchExams, fetchPreferences } from './api';
import { handleSignOut } from './auth';

function App() {
  const [user, setUser] = createSignal(null);
  const [timetable, setTimetable] = createSignal(null);
  const [exams, setExams] = createSignal([]);
  const [preferences, setPreferences] = createSignal(null);
  const navigate = useNavigate();
  const location = useLocation();

  onMount(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);

    if (
      user &&
      (location.pathname === '/' || location.pathname === '/login')
    ) {
      navigate('/preferences');
    } else if (
      !user &&
      location.pathname !== '/' &&
      location.pathname !== '/login'
    ) {
      navigate('/login');
    }
  });

  createEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (
          session?.user &&
          (location.pathname === '/login' || location.pathname === '/')
        ) {
          navigate('/preferences');
        } else if (
          !session?.user &&
          location.pathname !== '/' &&
          location.pathname !== '/login'
        ) {
          navigate('/login');
        }
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  });

  createEffect(() => {
    if (user()) {
      fetchTimetable(setTimetable);
      fetchExams(setExams);
      fetchPreferences(setPreferences);
    }
  });

  return (
    <div class="min-h-screen">
      <Routes>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={Login} />
        <Route
          path="/preferences"
          element={
            user() ? (
              <ProtectedRoute
                user={user}
                setUser={setUser}
                timetable={timetable}
                setTimetable={setTimetable}
                exams={exams}
                setExams={setExams}
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
            user() ? (
              <ProtectedRoute
                user={user}
                setUser={setUser}
                timetable={timetable}
                setTimetable={setTimetable}
                exams={exams}
                setExams={setExams}
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
            user() ? (
              <ProtectedRoute
                user={user}
                setUser={setUser}
                timetable={timetable}
                setTimetable={setTimetable}
                exams={exams}
                setExams={setExams}
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
    </div>
  );
}

export default App;