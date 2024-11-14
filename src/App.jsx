import { createSignal, onMount, createEffect, For, Show } from 'solid-js';
import { supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate, Route, Routes } from '@solidjs/router';
import Preferences from './components/Preferences';
import Exams from './components/Exams';
import Timetable from './components/Timetable';

function App() {
  const navigate = useNavigate();
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [loading, setLoading] = createSignal(false);

  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
      navigate('/preferences');
    }
  };

  onMount(checkUserSignedIn);

  createEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
        navigate('/preferences');
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
    navigate('/');
  };

  return (
    <div class="min-h-screen bg-black text-white p-4">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-gray-800 rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-center text-white">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                showLinks={false}
                view="magic_link"
                class="cursor-pointer"
              />
            </div>
          </div>
        }
      >
        <div class="flex flex-col h-full">
          <header class="flex justify-between items-center mb-8">
            <h1 class="text-4xl font-bold">UpGrade</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </header>
          <main class="flex-grow">
            <Routes>
              <Route path="/preferences" component={Preferences} />
              <Route path="/exams" component={Exams} />
              <Route path="/timetable" component={Timetable} />
              <Route path="*" element={<Preferences />} />
            </Routes>
          </main>
        </div>
      </Show>
    </div>
  );
}

export default App;