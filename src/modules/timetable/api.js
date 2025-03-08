import { makeAuthenticatedRequest, handleApiResponse } from '@/modules/core/api';
import { validateTimetableEntry } from './validators';
import { eventBus, events } from '@/modules/core/events';

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
  },
  
  /**
   * Generate timetable
   * @param {Array} exams - Array of exam objects
   * @param {string} startDate - Start date string
   * @param {Object} revisionTimes - Revision times configuration
   * @param {Object} blockTimes - Block times configuration
   * @returns {Promise<Array>} Generated timetable entries
   */
  async generateTimetable(exams, startDate, revisionTimes, blockTimes) {
    // Import the generator dynamically to avoid circular dependencies
    const { generateTimetable } = await import('../timetable/internal/timetableGeneratorCore');
    
    try {
      return await generateTimetable(exams, startDate, revisionTimes, blockTimes);
    } catch (error) {
      console.error('Error generating timetable:', error);
      throw error;
    }
  }
};