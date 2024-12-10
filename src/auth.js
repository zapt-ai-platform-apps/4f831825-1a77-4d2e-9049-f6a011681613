import { supabase } from './supabaseClient';

export const handleSignOut = async (setUser, navigate) => {
  await supabase.auth.signOut();
  setUser(null);
  navigate('/login');
};