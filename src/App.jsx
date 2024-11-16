import { createSignal, onMount, createEffect } from 'solid-js';
import { supabase } from './supabaseClient';
import { Routes, Route, useNavigate, useLocation, Link } from '@solidjs/router';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Preferences from './components/Preferences';
import Exams from './components/Exams';
import Timetable from './components/Timetable';

function App() {
  const [user, setUser] = createSignal(null);
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/login');
  };

  const ProtectedRoute = (Component) => {
    return (
      <div class="flex flex-col min-h-screen bg-gradient-to-b from-[#004AAD] to-[#5DE0E6] text-white">
        <header class="flex flex-col sm:flex-row items-center sm:justify-between mb-8 space-y-4 sm:space-y-0 p-4">
          <h1 class="text-4xl font-bold">UpGrade</h1>
          <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <nav class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
            </nav>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>
        </header>
        <main class="flex-grow p-4 flex items-center justify-center">
          {Component}
        </main>
      </div>
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
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </div>
  );
}

export default App;