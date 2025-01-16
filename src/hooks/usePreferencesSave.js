import { savePreferencesHelper } from './usePreferencesHelpers';

export const handleSavePreferences = async ({
  supabase,
  savePreferences,
  generateTimetable,
  fetchTimetable,
  setTimetable,
  preferences,
  setError,
  setLoading,
  navigate,
  Sentry,
}) => {
  try {
    await savePreferencesHelper({
      supabase,
      savePreferences,
      generateTimetable,
      fetchTimetable,
      setTimetable,
      preferences,
      setError,
      setLoading,
      navigate,
      Sentry,
    });
  } catch (err) {
    console.error('Error saving preferences (handleSavePreferences):', err);
    Sentry.captureException(err);
  } finally {
    setLoading(false);
  }
};