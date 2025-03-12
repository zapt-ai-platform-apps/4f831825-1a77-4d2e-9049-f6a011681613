import { useState, useEffect } from 'react';
import { api as preferencesApi } from '../api';
import { savePreferences, validatePreferencesInput } from './service';
import * as Sentry from '@sentry/browser';

/**
 * Default preferences state
 */
const DEFAULT_PREFERENCES = {
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
  periodSpecificAvailability: []
};

/**
 * Hook for managing preferences state
 * @returns {Object} Preferences state and methods
 */
export function usePreferencesState() {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch preferences on mount
  useEffect(() => {
    async function fetchPreferences() {
      setLoading(true);
      try {
        const data = await preferencesApi.getPreferences();
        
        if (data) {
          // Merge with defaults to ensure all properties exist
          setPreferences({
            ...DEFAULT_PREFERENCES,
            ...data,
            blockTimes: {
              ...DEFAULT_PREFERENCES.blockTimes,
              ...(data.blockTimes || {})
            },
            periodSpecificAvailability: data.periodSpecificAvailability || []
          });
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
        Sentry.captureException(error);
        setError('Failed to load preferences. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPreferences();
  }, []);
  
  // Handle block times change
  const handleBlockTimesChange = (blockName, times) => {
    setPreferences((prev) => ({
      ...prev,
      blockTimes: {
        ...prev.blockTimes,
        [blockName]: times,
      },
    }));
  };
  
  // Handle block selection
  const handleBlockSelection = (day, block) => {
    const dayBlocks = preferences.revisionTimes[day] || [];
    const hasBlock = dayBlocks.includes(block);
    
    setPreferences({
      ...preferences,
      revisionTimes: {
        ...preferences.revisionTimes,
        [day]: hasBlock
          ? dayBlocks.filter((b) => b !== block)
          : [...dayBlocks, block],
      },
    });
  };
  
  // Handle start date change
  const handleStartDateChange = (date) => {
    setPreferences({
      ...preferences,
      startDate: date,
    });
  };

  // Handle adding period-specific availability
  const handleAddPeriodAvailability = (periodAvailability) => {
    setPreferences({
      ...preferences,
      periodSpecificAvailability: [
        ...preferences.periodSpecificAvailability,
        periodAvailability
      ]
    });
  };

  // Handle removing period-specific availability
  const handleRemovePeriodAvailability = (index) => {
    setPreferences({
      ...preferences,
      periodSpecificAvailability: preferences.periodSpecificAvailability.filter((_, i) => i !== index)
    });
  };

  // Handle updating period-specific availability
  const handleUpdatePeriodAvailability = (index, updatedPeriod) => {
    setPreferences({
      ...preferences,
      periodSpecificAvailability: preferences.periodSpecificAvailability.map((period, i) => 
        i === index ? updatedPeriod : period
      )
    });
  };

  // Handle period-specific block selection
  const handlePeriodBlockSelection = (periodIndex, day, block) => {
    if (periodIndex < 0 || periodIndex >= preferences.periodSpecificAvailability.length) {
      return;
    }

    const period = preferences.periodSpecificAvailability[periodIndex];
    const dayBlocks = period.revisionTimes[day] || [];
    const hasBlock = dayBlocks.includes(block);
    
    const updatedPeriod = {
      ...period,
      revisionTimes: {
        ...period.revisionTimes,
        [day]: hasBlock
          ? dayBlocks.filter((b) => b !== block)
          : [...dayBlocks, block],
      },
    };

    handleUpdatePeriodAvailability(periodIndex, updatedPeriod);
  };
  
  // Handle save
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      // Validate first
      validatePreferencesInput(preferences);
      
      // Save to server
      await savePreferences(preferences);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving preferences:', error);
      Sentry.captureException(error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };
  
  return {
    preferences,
    setPreferences,
    loading,
    saving,
    error,
    handleBlockTimesChange,
    handleBlockSelection,
    handleStartDateChange,
    handleSave,
    handleAddPeriodAvailability,
    handleRemovePeriodAvailability,
    handleUpdatePeriodAvailability,
    handlePeriodBlockSelection,
  };
}