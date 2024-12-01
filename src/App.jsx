import { createSignal, onMount, createEffect } from 'solid-js';
import { supabase } from './supabaseClient';
import { Routes, Route, useNavigate, useLocation } from '@solidjs/router';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Preferences from './components/Preferences';
import Exams from './components/Exams';
import Timetable from './components/Timetable';
import ProtectedRoute from './components/ProtectedRoute';
import * as Sentry from '@sentry/browser';

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  const fetchTimetable = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch('/api/getTimetable', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const { data } = await response.json();
        if (data) {
          setTimetable(data);
        } else {
          setTimetable({});
        }
      } else {
        console.error('Error fetching timetable:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      Sentry.captureException(error);
    }
  };

  const fetchExams = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch('/api/getExams', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const { data } = await response.json();
        if (data) {
          setExams(data);
        } else {
          setExams([]);
        }
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error fetching exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      Sentry.captureException(error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch('/api/getPreferences', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        if (data) {
          setPreferences(data);
        }
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error fetching preferences');
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      Sentry.captureException(error);
    }
  };

  createEffect(() => {
    if (user()) {
      fetchTimetable();
      fetchExams();
      fetchPreferences();
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