import { supabase } from '../supabaseClient';

export async function saveExam(formData, editExam) {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error('Missing Authorization header');
  }

  const url = editExam ? '/api/updateExam' : '/api/saveExams';
  const method = editExam ? 'PUT' : 'POST';
  const body = editExam
    ? { data: { id: editExam.id, ...formData } }
    : { data: { ...formData } };

  const response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save exam.');
  }
}