import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';

function useAuth() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
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
    };

    checkUser();
  }, [navigate, location.pathname]);

  useEffect(() => {
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
  }, [navigate, location.pathname]);

  return { user };
}

export default useAuth;