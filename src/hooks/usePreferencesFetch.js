import { fetchPreferencesHelper } from './usePreferencesHelpers';

export const fetchPrefs = async (
  supabase,
  getPreferences,
  setLoadingPrefs,
  setPreferences,
  preferences,
  Sentry
) => {
  setLoadingPrefs(true);
  try {
    await fetchPreferencesHelper(
      supabase,
      getPreferences,
      setLoadingPrefs,
      setPreferences,
      preferences,
      Sentry
    );
  } catch (err) {
    console.error('Error in fetchPrefs:', err);
    Sentry.captureException(err);
  }
};