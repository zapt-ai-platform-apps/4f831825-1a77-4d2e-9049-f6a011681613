import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';

export async function saveSession(originalData, sessionData, date, onSessionSaved) {
  try {
    const {
      data: { session: authSession },
    } = await supabase.auth.getSession();

    const url = originalData ? '/api/updateSession' : '/api/saveSession';
    const method = originalData ? 'PUT' : 'POST';

    const payload = originalData
      ? {
          originalDate: date,
          originalBlock: originalData.block,
          data: sessionData(),
        }
      : { data: sessionData() };

    const response = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${authSession.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      onSessionSaved();
      return true;
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Error saving session');
    }
  } catch (error) {
    console.error('Error saving session:', error);
    Sentry.captureException(error);
    throw error;
  }
}