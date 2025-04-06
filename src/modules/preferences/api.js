import { makeAuthenticatedRequest, handleApiResponse } from '../core/api';

export const api = {
  /**
   * Get user preferences
   */
  async getPreferences() {
    try {
      const response = await makeAuthenticatedRequest('/api/getPreferences');
      const result = await handleApiResponse(response, 'Fetching preferences');
      return result.data || null;
    } catch (error) {
      console.error('Error fetching preferences:', error);
      throw error;
    }
  },

  /**
   * Save user preferences
   * @param {Object} data - Preferences data
   */
  async savePreferences(data) {
    try {
      const response = await makeAuthenticatedRequest('/api/savePreferences', {
        method: 'POST',
        body: JSON.stringify({ data })
      });
      await handleApiResponse(response, 'Saving preferences');
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  },
  
  /**
   * Get period-specific availability
   */
  async getPeriodSpecificAvailability() {
    try {
      const response = await makeAuthenticatedRequest('/api/getPeriodSpecificAvailability');
      const result = await handleApiResponse(response, 'Fetching period-specific availability');
      return result.data || [];
    } catch (error) {
      console.error('Error fetching period-specific availability:', error);
      throw error;
    }
  },
  
  /**
   * Save period-specific availability
   * @param {Array} entries - Array of period-specific availability entries
   */
  async savePeriodSpecificAvailability(entries) {
    try {
      const response = await makeAuthenticatedRequest('/api/savePeriodSpecificAvailability', {
        method: 'POST',
        body: JSON.stringify({ data: entries })
      });
      await handleApiResponse(response, 'Saving period-specific availability');
      return true;
    } catch (error) {
      console.error('Error saving period-specific availability:', error);
      throw error;
    }
  }
};