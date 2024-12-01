import { createSignal, Show } from 'solid-js';
import { supabase } from '../supabaseClient';
import { TimetableProvider } from '../contexts/TimetableContext';
import Header from './Header';
import MobileMenu from './MobileMenu';
import Footer from './Footer';
import { useNavigate, useLocation } from '@solidjs/router';

function ProtectedRoute(props) {
  const [menuOpen, setMenuOpen] = createSignal(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    props.setUser(null);
    navigate('/login');
  };

  return (
    <TimetableProvider
      value={{
        timetable: props.timetable,
        setTimetable: props.setTimetable,
        exams: props.exams,
        setExams: props.setExams,
        preferences: props.preferences,
      }}
    >
      <div class="flex flex-col min-h-screen bg-gradient-to-b from-[#004AAD] to-[#5DE0E6] text-white">
        <Header
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          handleSignOut={handleSignOut}
          location={location}
        />
        <Show when={menuOpen()}>
          <MobileMenu
            setMenuOpen={setMenuOpen}
            handleSignOut={handleSignOut}
            location={location}
          />
        </Show>
        <main class="flex-grow p-4 flex items-center justify-center">
          {props.children}
        </main>
        <Footer />
      </div>
    </TimetableProvider>
  );
}

export default ProtectedRoute;