import { supabase } from '../supabaseClient';

export const deleteExam = async (id) => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;

  const response = await fetch('/api/deleteExam', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete exam.');
  }
};