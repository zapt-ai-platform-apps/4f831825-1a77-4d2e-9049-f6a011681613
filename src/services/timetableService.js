export async function generateTimetable(supabase) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const response = await fetch('/api/generateTimetable', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });
  if (response.ok) {
    window.location.href = '/timetable';
  } else {
    const errorText = await response.text();
    throw new Error(errorText || 'Error generating timetable');
  }
}