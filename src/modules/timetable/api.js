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
      const result = await handleApiResponse(response, 'Fetching timetable');
      
      console.log('[Timetable API] Retrieved timetable data');
      
      return result || { data: {}, periodAvailability: [] };
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
   * @param {Object} entry - Entry with date and block to delete
   * @returns {Promise<Object>} Result message
   */
  async deleteTimetableEntry(entry) {
    try {
      const response = await makeAuthenticatedRequest('/api/deleteTimetableEntry', {
        method: 'DELETE',
        body: JSON.stringify({ 
          date: entry.date,
          block: entry.block
        })
      });
      
      const result = await handleApiResponse(response, 'Deleting timetable entry');
      
      // Publish timetable updated event
      eventBus.publish(events.TIMETABLE_UPDATED, { deletedEntry: entry });
      
      return result;
    } catch (error) {
      console.error('Error deleting timetable entry:', error);
      throw error;
    }
  },
  
  /**
   * Update a timetable entry
   * @param {Object} entry - Entry with date, block and fields to update
   * @returns {Promise<Object>} Result message
   */
  async updateTimetableEntry(entry) {
    try {
      const response = await makeAuthenticatedRequest('/api/updateTimetableEntry', {
        method: 'PUT',
        body: JSON.stringify(entry)
      });
      
      const result = await handleApiResponse(response, 'Updating timetable entry');
      
      // Publish timetable updated event
      eventBus.publish(events.TIMETABLE_UPDATED, { updatedEntry: entry });
      
      return result;
    } catch (error) {
      console.error('Error updating timetable entry:', error);
      throw error;
    }
  },
  
  /**
   * Swap two timetable entries
   * @param {Object} entry1 - First entry with date, block, and subject
   * @param {Object} entry2 - Second entry with date, block, and subject
   * @returns {Promise<Object>} Result message
   */
  async swapTimetableEntries(entry1, entry2) {
    try {
      const response = await makeAuthenticatedRequest('/api/swapTimetableEntries', {
        method: 'POST',
        body: JSON.stringify({ entry1, entry2 })
      });
      
      const result = await handleApiResponse(response, 'Swapping timetable entries');
      
      // Publish timetable updated event
      eventBus.publish(events.TIMETABLE_UPDATED, { swappedEntries: { entry1, entry2 } });
      
      return result;
    } catch (error) {
      console.error('Error swapping timetable entries:', error);
      throw error;
    }
  },
  
  /**
   * Set availability for a specific period
   * @param {string} startDate - Start date string in YYYY-MM-DD format
   * @param {string} endDate - End date string in YYYY-MM-DD format
   * @param {Array} availability - Array of availability objects
   * @returns {Promise<Object>} Result message
   */
  async setPeriodAvailability(startDate, endDate, availability) {
    try {
      const response = await makeAuthenticatedRequest('/api/setPeriodAvailability', {
        method: 'POST',
        body: JSON.stringify({ startDate, endDate, availability })
      });
      
      const result = await handleApiResponse(response, 'Setting period availability');
      
      // Publish timetable updated event
      eventBus.publish(events.TIMETABLE_UPDATED, { 
        periodAvailability: { startDate, endDate, availability } 
      });
      
      return result;
    } catch (error) {
      console.error('Error setting period availability:', error);
      throw error;
    }
  },
  
  /**
   * Generate timetable
   * @param {Array} exams - Array of exam objects
   * @param {string} startDate - Start date string in YYYY-MM-DD format
   * @param {Object} revisionTimes - Available revision times by day of week
   * @param {Object} blockTimes - User block time preferences
   * @returns {Promise<Array>} Generated timetable entries
   */
  async generateTimetable(exams, startDate, revisionTimes, blockTimes = {}) {
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