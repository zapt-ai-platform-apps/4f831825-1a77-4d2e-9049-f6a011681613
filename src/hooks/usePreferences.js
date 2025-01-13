import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/react';
import {
  getPreferences,
  savePreferences,
  generateTimetable,
} from '../api/preferencesAPI';
import { fetchPreferencesHelper, savePreferencesHelper } from './usePreferencesHelpers';

function usePreferences(navigate) {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPreferences = async () => {
    await fetchPreferencesHelper(
      supabase,
      getPreferences,
      setLoading,
      setPreferences,
      preferences,
      Sentry
    );
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleBlockTimesChange = (blockName, times) => {
    setPreferences({
      ...preferences,
      blockTimes: {
        ...preferences.blockTimes,
        [blockName]: times,
      },
    });
  };

  const handleSavePreferences = async () => {
    await savePreferencesHelper(
      supabase,
      savePreferences,
      generateTimetable,
      preferences,
      setError,
      setLoading,
      navigate,
      Sentry
    );
  };

  return {
    preferences,
    setPreferences,
    loading,
    error,
    handleSavePreferences,
    handleBlockTimesChange,
  };
}

export default usePreferences;