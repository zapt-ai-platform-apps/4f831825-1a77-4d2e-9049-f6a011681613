import { createSignal, onMount, createEffect } from 'solid-js';
import { supabase } from './supabaseClient';
import { Routes, Route, useNavigate, useLocation, Link } from '@solidjs/router';
import { TimetableProvider } from './contexts/TimetableContext';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Preferences from './components/Preferences';
import Exams from './components/Exams';
import Timetable from './components/Timetable';
import TimetableDayDetails from './components/TimetableDayDetails';

function App() {
  const [user, setUser] = createSignal(null);
  const [timetable, setTimetable] = createSignal(null);
  const [exams, setExams] = createSignal([]);
  const navigate = useNavigate();
  const location = useLocation();

  onMount(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user && (location.pathname === '/' || location.pathname === '/login')) {
      navigate('/preferences');
    } else if (!user && location.pathname !== '/' && location.pathname !== '/login') {
      navigate('/login');
    }
  });

  createEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && (location.pathname === '/login' || location.pathname === '/')) {
        navigate('/preferences');
      } else if (!session?.user && location.pathname !== '/' && location.pathname !== '/login') {
        navigate('/login');
      }
    });

    return () => {
      authListener?.unsubscribe();
    };
  });

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
          const timetableData = {};
          data.forEach((day) => {
            timetableData[day.date] = day;
          });
          setTimetable(timetableData);
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
      const { data: { session } } = await supabase.auth.getSession();
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

  createEffect(() => {
    if (user()) {
      fetchTimetable();
      fetchExams();
    }
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  const ProtectedRoute = (Component) => {
    const [menuOpen, setMenuOpen] = createSignal(false);

    return (
      <TimetableProvider value={{ timetable, setTimetable, exams, setExams }}>
        <div class="flex flex-col min-h-screen bg-gradient-to-b from-[#004AAD] to-[#5DE0E6] text-white">
          <header class="flex items-center justify-between mb-8 p-4">
            <h1 class="text-4xl font-bold">UpGrade</h1>
            <div class="sm:hidden">
              <button
                class="text-white cursor-pointer focus:outline-none"
                onClick={() => setMenuOpen(true)}
              >
                &#9776;
              </button>
            </div>
            <nav class="hidden sm:flex space-x-4">
              <Link
                href="/preferences"
                class="hover:underline cursor-pointer"
                classList={{ 'font-bold': location.pathname === '/preferences' }}
              >
                Preferences
              </Link>
              <Link
                href="/exams"
                class="hover:underline cursor-pointer"
                classList={{ 'font-bold': location.pathname === '/exams' }}
              >
                Exams
              </Link>
              <Link
                href="/timetable"
                class="hover:underline cursor-pointer"
                classList={{ 'font-bold': location.pathname === '/timetable' }}
              >
                Timetable
              </Link>
              <button
                class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </nav>
          </header>
          {/* Mobile Menu Modal */}
          <Show when={menuOpen()}>
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div class="bg-white rounded-lg p-6 w-3/4 max-w-xs relative">
                <button
                  class="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
                  onClick={() => setMenuOpen(false)}
                >
                  &times;
                </button>
                <nav class="flex flex-col space-y-4">
                  <Link
                    href="/preferences"
                    class="text-xl text-blue-600 hover:underline cursor-pointer"
                    classList={{ 'font-bold': location.pathname === '/preferences' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Preferences
                  </Link>
                  <Link
                    href="/exams"
                    class="text-xl text-blue-600 hover:underline cursor-pointer"
                    classList={{ 'font-bold': location.pathname === '/exams' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Exams
                  </Link>
                  <Link
                    href="/timetable"
                    class="text-xl text-blue-600 hover:underline cursor-pointer"
                    classList={{ 'font-bold': location.pathname === '/timetable' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Timetable
                  </Link>
                  <button
                    class="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                    onClick={() => {
                      handleSignOut();
                      setMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </button>
                </nav>
              </div>
            </div>
          </Show>
          <main class="flex-grow p-4 flex items-center justify-center">
            {Component}
          </main>
        </div>
      </TimetableProvider>
    );
  };

  return (
    <div class="min-h-screen">
      <Routes>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={Login} />
        <Route
          path="/preferences"
          element={user() ? ProtectedRoute(<Preferences />) : <Login />}
        />
        <Route
          path="/exams"
          element={user() ? ProtectedRoute(<Exams />) : <Login />}
        />
        <Route
          path="/timetable"
          element={user() ? ProtectedRoute(<Timetable />) : <Login />}
        />
        <Route
          path="/timetable/:date"
          element={user() ? ProtectedRoute(<TimetableDayDetails />) : <Login />}
        />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </div>
  );
}

export default App;