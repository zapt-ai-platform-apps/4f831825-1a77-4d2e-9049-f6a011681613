import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';

export const fetchExams = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch('/api/getExams', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching exams:', errorText);
      Sentry.captureMessage(errorText);
      throw new Error(errorText);
    }

    const { data } = await response.json();
    console.log('[DEBUG] Fetched Exams:', data);
    return data || [];
  } catch (error) {
    console.error('Error fetching exams:', error);
    Sentry.captureException(error);
    throw error;
  }
};