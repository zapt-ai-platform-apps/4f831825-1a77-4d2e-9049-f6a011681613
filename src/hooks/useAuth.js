import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Sentry from '@sentry/react';

function useAuth() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Sign out function so that nothing outside this hook needs to call setUser
  const signOut = async () => {
    try {
      console.log('[INFO] User signed out.');
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Sentry.captureException(error);
    }
  };

  // Listen for sign in and sign out events only once via subscription
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // This is the single invocation of setUser for sign in or sign out
      const newUser = session?.user ?? null;
      setUser(newUser);

      if (newUser && (location.pathname === '/login' || location.pathname === '/')) {
        navigate('/preferences');
      } else if (!newUser && location.pathname !== '/' && location.pathname !== '/login') {
        navigate('/login');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return { user, signOut };
}

export default useAuth;