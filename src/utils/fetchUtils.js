import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';

export const fetchTimetable = async (setTimetable, setError) => {
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
      setError('Error fetching timetable');
    }
  } catch (error) {
    console.error('Error fetching timetable:', error);
    Sentry.captureException(error);
    setError('Error fetching timetable');
  }
};

export const fetchExams = async (setExams, setError) => {
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
      console.error('Error fetching exams:', errorText);
      setError('Error fetching exams');
    }
  } catch (error) {
    console.error('Error fetching exams:', error);
    Sentry.captureException(error);
    setError('Error fetching exams');
  }
};