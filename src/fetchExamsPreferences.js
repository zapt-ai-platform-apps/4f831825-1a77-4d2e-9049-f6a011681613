import { supabase } from './supabaseClient';
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

export const fetchPreferences = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch('/api/getPreferences', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching preferences:', errorText);
      Sentry.captureMessage(errorText);
      throw new Error(errorText);
    }

    const { data } = await response.json();
    console.log('[DEBUG] Fetched Preferences:', data);
    return data || null;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    Sentry.captureException(error);
    throw error;
  }
};