import { makeAuthenticatedRequest, handleApiResponse } from '../core/api';
import { validatePreferences } from './validators';
import { eventBus, events } from '../core/events';

/**
 * Preferences module public API
 */
export const api = {
  /**
   * Get user preferences
   * @returns {Promise<Object|null>} User preferences or null if not set
   */
  async getPreferences() {
    try {
      const response = await makeAuthenticatedRequest('/api/getPreferences');
      const { data } = await handleApiResponse(response, 'Fetching preferences');
      
      console.log('[Preferences API] Retrieved preferences:', data);
      
      if (!data) return null;
      
      // Validate preferences before returning
      return validatePreferences(data, {
        actionName: 'getPreferences',
        location: 'preferences/api.js',
        direction: 'outgoing',
        moduleFrom: 'preferences',
        moduleTo: 'client'
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
      throw error;
    }
  },
  
  /**
   * Save user preferences
   * @param {Object} preferences - User preferences to save
   * @returns {Promise<Object>} Result message
   */
  async savePreferences(preferences) {
    try {
      // Validate preferences before saving
      const validatedPreferences = validatePreferences(preferences, {
        actionName: 'savePreferences',
        location: 'preferences/api.js',
        direction: 'incoming',
        moduleFrom: 'client',
        moduleTo: 'preferences'
      });
      
      const response = await makeAuthenticatedRequest('/api/savePreferences', {
        method: 'POST',
        body: JSON.stringify({ data: validatedPreferences })
      });
      
      const result = await handleApiResponse(response, 'Saving preferences');
      
      // Publish preferences updated event
      eventBus.publish(events.PREFERENCES_UPDATED, {
        preferences: validatedPreferences
      });
      
      return result;
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }
};