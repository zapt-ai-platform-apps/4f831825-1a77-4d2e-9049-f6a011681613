import { supabase } from './supabaseClient';
import * as Sentry from '@sentry/browser';

export const fetchTimetable = async (setTimetable) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch('/api/getTimetable', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const { data } = await response.json();
      if (data) {
        setTimetable(data);
      } else {
        setTimetable({});
      }
    } else {
      console.error('Error fetching timetable:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching timetable:', error);
    Sentry.captureException(error);
  }
};

export const fetchExams = async (setExams) => {
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
    if (response.ok) {
      const { data } = await response.json();
      if (data) {
        setExams(data);
      } else {
        setExams([]);
      }
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Error fetching exams');
    }
  } catch (error) {
    console.error('Error fetching exams:', error);
    Sentry.captureException(error);
  }
};

export const fetchPreferences = async (setPreferences) => {
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

    if (response.ok) {
      const { data } = await response.json();
      if (data) {
        setPreferences(data);
      }
    } else {
      const errorText = await response.text();
      throw new Error(errorText || 'Error fetching preferences');
    }
  } catch (error) {
    console.error('Error fetching preferences:', error);
    Sentry.captureException(error);
  }
};