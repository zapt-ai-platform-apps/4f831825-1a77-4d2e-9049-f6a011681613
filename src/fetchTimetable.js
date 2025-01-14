import { supabase } from './supabaseClient';
import * as Sentry from '@sentry/browser';

export const fetchTimetable = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Ensure we have a valid session before proceeding
    if (!session?.access_token) {
      console.error('No valid session found. Skipping timetable fetch.');
      return {};
    }

    const response = await fetch('/api/getTimetable', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching timetable:', errorText);
      Sentry.captureMessage(errorText);
      throw new Error(errorText);
    }

    const { data } = await response.json();
    console.log('[DEBUG] Fetched Timetable:', data);
    return data || {};
  } catch (error) {
    console.error('Error fetching timetable:', error);
    Sentry.captureException(error);
    throw error;
  }
};