import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/react';
import {
  getPreferences,
  savePreferences,
  generateTimetable,
} from '../api/preferencesAPI';
import { fetchPrefs } from './usePreferencesFetch';
import { handleSavePreferences } from './usePreferencesSave';
import { fetchTimetable } from '../fetchTimetable';
import { useTimetable } from '../contexts/TimetableContext';

function usePreferences(navigate) {
  const { setTimetable } = useTimetable();

  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [saving, setSaving] = useState(false);

  const [preferences, setPreferences] = useState({
    revisionTimes: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
    startDate: '',
    blockTimes: {
      Morning: { startTime: '09:00', endTime: '13:00' },
      Afternoon: { startTime: '14:00', endTime: '17:00' },
      Evening: { startTime: '19:00', endTime: '21:00' },
    },
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrefs(
      supabase,
      getPreferences,
      setLoadingPrefs,
      setPreferences,
      preferences,
      Sentry
    );
  }, []);

  const handleBlockTimesChange = (blockName, times) => {
    setPreferences((prev) => ({
      ...prev,
      blockTimes: {
        ...prev.blockTimes,
        [blockName]: times,
      },
    }));
  };

  const savePreferencesFn = async () => {
    await handleSavePreferences({
      supabase,
      savePreferences,
      generateTimetable,
      fetchTimetable,
      setTimetable,
      preferences,
      setError,
      setLoading: setSaving,
      navigate,
      Sentry,
    });
  };

  return {
    preferences,
    setPreferences,
    loadingPrefs,
    saving,
    error,
    handleSavePreferences: savePreferencesFn,
    handleBlockTimesChange,
  };
}

export default usePreferences;