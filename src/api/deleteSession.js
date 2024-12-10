import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';

export async function deleteSession(date, block) {
  try {
    const {
      data: { session: authSession },
    } = await supabase.auth.getSession();

    const response = await fetch('/api/deleteSession', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authSession.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        date: date,
        block: block,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error deleting session');
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    Sentry.captureException(error);
    throw error;
  }
}