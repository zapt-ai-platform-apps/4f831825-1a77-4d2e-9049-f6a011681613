import { makeAuthenticatedRequest, handleApiResponse } from '../core/api';
import { validateTimetableEntry } from './validators';
import { eventBus, events } from '../core/events';

/**
 * Timetable module public API
 */
export const api = {
  /**
   * Get user timetable
   * @returns {Promise<Object>} Timetable data by date
   */
  async getTimetable() {
    try {
      const response = await makeAuthenticatedRequest('/api/getTimetable');
      const { data } = await handleApiResponse(response, 'Fetching timetable');
      
      console.log('[Timetable API] Retrieved timetable data');
      
      return data || {};
    } catch (error) {
      console.error('Error fetching timetable:', error);
      throw error;
    }
  },
  
  /**
   * Save a timetable entry
   * @param {Object} entry - The timetable entry to save
   * @returns {Promise<Object>} Result message
   */
  async saveTimetableEntry(entry) {
    try {
      // Validate entry before saving
      const validatedEntry = validateTimetableEntry(entry, {
        actionName: 'saveTimetableEntry',
        location: 'timetable/api.js',
        direction: 'incoming',
        moduleFrom: 'client',
        moduleTo: 'timetable'
      });
      
      const response = await makeAuthenticatedRequest('/api/saveTimetableEntry', {
        method: 'POST',
        body: JSON.stringify({ data: validatedEntry })
      });
      
      const result = await handleApiResponse(response, 'Saving timetable entry');
      
      // Publish timetable updated event
      eventBus.publish(events.TIMETABLE_UPDATED, { entry: validatedEntry });
      
      return result;
    } catch (error) {
      console.error('Error saving timetable entry:', error);
      throw error;
    }
  },
  
  /**
   * Delete a timetable entry
   * @param {Object} entryId - ID of the entry to delete
   * @returns {Promise<Object>} Result message
   */
  async deleteTimetableEntry(entryId) {
    try {
      const response = await makeAuthenticatedRequest('/api/deleteTimetableEntry', {
        method: 'DELETE',
        body: JSON.stringify({ id: entryId })
      });
      
      const result = await handleApiResponse(response, 'Deleting timetable entry');
      
      // Publish timetable updated event
      eventBus.publish(events.TIMETABLE_UPDATED, { deletedEntryId: entryId });
      
      return result;
    } catch (error) {
      console.error('Error deleting timetable entry:', error);
      throw error;
    }
  }
};