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

  // Validate period-specific availability if present
  if (preferences.periodSpecificAvailability && preferences.periodSpecificAvailability.length > 0) {
    const periods = preferences.periodSpecificAvailability;

    for (let i = 0; i < periods.length; i++) {
      const periodA = periods[i];
      
      // Check required fields
      if (!periodA.startDate || !periodA.endDate) {
        throw new Error('Start and end dates are required for each specific period');
      }

      // Check date order
      if (new Date(periodA.endDate) < new Date(periodA.startDate)) {
        throw new Error('End date must be after or equal to start date for each specific period');
      }

      // Check if at least one block is selected
      const hasPeriodBlock = Object.values(periodA.revisionTimes).some(
        (blocks) => blocks.length > 0
      );

      if (!hasPeriodBlock) {
        throw new Error('Please select at least one revision time for each specific period');
      }

      // Check for overlapping date ranges with all other periods
      const startDateA = new Date(periodA.startDate);
      const endDateA = new Date(periodA.endDate);

      for (let j = 0; j < periods.length; j++) {
        if (i === j) continue; // Skip comparing to self
        
        const periodB = periods[j];
        if (!periodB.startDate || !periodB.endDate) continue;
        
        const startDateB = new Date(periodB.startDate);
        const endDateB = new Date(periodB.endDate);
        
        // Check if periods overlap
        if (startDateA <= endDateB && endDateA >= startDateB) {
          throw new Error('Period-specific availability dates cannot overlap');
        }
      }
    }
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

  // Filter and validate period-specific availability
  const filteredPeriodSpecificAvailability = (preferences.periodSpecificAvailability || [])
    .filter(period => period.startDate && period.endDate)
    .map(period => {
      // Filter revision times for each period
      const periodRevisionTimes = {};
      Object.keys(period.revisionTimes).forEach((day) => {
        const dayBlocks = period.revisionTimes[day];
        periodRevisionTimes[day] = dayBlocks.filter((block) =>
          validBlocks.includes(block)
        );
      });

      return {
        startDate: period.startDate,
        endDate: period.endDate,
        revisionTimes: periodRevisionTimes
      };
    });
  
  return {
    startDate: preferences.startDate,
    revisionTimes: filteredRevisionTimes,
    blockTimes: filteredBlockTimes,
    periodSpecificAvailability: filteredPeriodSpecificAvailability
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