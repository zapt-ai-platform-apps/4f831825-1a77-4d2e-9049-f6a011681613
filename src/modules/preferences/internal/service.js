import { api as preferencesApi } from '../api';
import { eventBus } from '../../core/events';
import { events } from '../events';
import * as Sentry from '@sentry/browser';

/**
 * Validates preferences input data
 * @param {Object} preferences - The preferences data to validate
 * @returns {boolean} - True if valid, throws error if not
 */
export function validatePreferencesInput(preferences) {
  // Check required fields
  if (!preferences.startDate) {
    throw new Error('Please select a start date');
  }
  
  // Check if at least one block is selected
  const hasSelectedBlock = Object.values(preferences.revisionTimes).some(
    (blocks) => blocks.length > 0
  );
  
  if (!hasSelectedBlock) {
    throw new Error('Please select at least one revision time');
  }
  
  return true;
}

/**
 * Prepare preferences data for saving
 * @param {Object} preferences - Raw preferences data
 * @returns {Object} - Prepared preferences data
 */
export function preparePreferencesForSaving(preferences) {
  const validBlocks = ['Morning', 'Afternoon', 'Evening'];
  
  // Filter revision times to ensure only valid blocks
  const filteredRevisionTimes = {};
  Object.keys(preferences.revisionTimes).forEach((day) => {
    const dayBlocks = preferences.revisionTimes[day];
    filteredRevisionTimes[day] = dayBlocks.filter((block) =>
      validBlocks.includes(block)
    );
  });
  
  // Filter block times to ensure only valid and complete entries
  const filteredBlockTimes = {};
  validBlocks.forEach((block) => {
    const times = preferences.blockTimes[block];
    if (times && times.startTime && times.endTime) {
      filteredBlockTimes[block] = times;
    }
  });
  
  return {
    startDate: preferences.startDate,
    revisionTimes: filteredRevisionTimes,
    blockTimes: filteredBlockTimes
  };
}

/**
 * Save preferences and generate timetable
 * @param {Object} preferences - The preferences to save
 * @returns {Promise<void>}
 */
export async function savePreferences(preferences) {
  try {
    // Validate input
    validatePreferencesInput(preferences);
    
    // Prepare data
    const preparedPreferences = preparePreferencesForSaving(preferences);
    
    // Save to server
    await preferencesApi.savePreferences(preparedPreferences);
    
    // Publish success event
    eventBus.publish(events.SAVED, { preferences: preparedPreferences });
    
    return { success: true };
  } catch (error) {
    console.error('Error in preferences service:', error);
    Sentry.captureException(error);
    
    // Publish error event
    eventBus.publish(events.ERROR, { error: error.message });
    
    throw error;
  }
}