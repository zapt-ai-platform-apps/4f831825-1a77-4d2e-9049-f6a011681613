import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export const handleSignOut = async (setUser, navigate) => {
  await supabase.auth.signOut();
  setUser(null);
  navigate('/login');
};