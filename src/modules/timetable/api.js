import { makeAuthenticatedRequest, handleApiResponse, db } from '@/modules/core/api';
import { validateTimetableEntry } from './validators';
import { eventBus, events } from '@/modules/core/events';
import { deleteGeneratedTimetableEntries, getUserPreferences, getUserExams, getUserRevisionTimes, getUserBlockTimes, insertTimetableEntries } from './internal/dataAccess';
import { generateTimetable as generateTimetableInternal } from './internal/timetableGenerator';
import { reviewTimetable as reviewTimetableInternal } from './internal/timetableReviewer';
import { saveTimetable as saveTimetableInternal } from './internal/timetableSaver';

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
   * Generate a timetable for a user
   * @param {string} userId - User ID
   * @param {Array} exams - Array of exam objects
   * @param {string} startDate - Start date string in YYYY-MM-DD format
   * @param {Object} revisionTimes - Available revision times by day of week
   * @param {Object} blockTimes - User block time preferences
   * @returns {Promise<Array>} Generated timetable entries
   */
  async generateTimetable(userId, exams, startDate, revisionTimes, blockTimes) {
    try {
      // Generate the timetable
      const generatedTimetable = await generateTimetableInternal(
        exams, 
        startDate, 
        revisionTimes,
        blockTimes
      );
      
      // Get AI review of timetable (optional enhancement)
      const reviewedTimetable = await reviewTimetableInternal(userId, generatedTimetable);
      
      // Save the timetable to the database
      await saveTimetableInternal(userId, reviewedTimetable);
      
      return reviewedTimetable;
    } catch (error) {
      console.error('Error generating timetable:', error);
      throw error;
    }
  },
  
  /**
   * Delete generated timetable entries for a user
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteGeneratedTimetableEntries(userId) {
    try {
      await deleteGeneratedTimetableEntries(db, userId);
    } catch (error) {
      console.error('Error deleting generated timetable entries:', error);
      throw error;
    }
  },
  
  /**
   * Get user preferences
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} User preferences or null
   */
  async getUserPreferences(userId) {
    try {
      return await getUserPreferences(db, userId);
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  },
  
  /**
   * Get user exams
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User exams
   */
  async getUserExams(userId) {
    try {
      return await getUserExams(db, userId);
    } catch (error) {
      console.error('Error getting user exams:', error);
      throw error;
    }
  },
  
  /**
   * Get user revision times
   * @param {string} userId - User ID
   * @returns {Promise<Array>} User revision times
   */
  async getUserRevisionTimes(userId) {
    try {
      return await getUserRevisionTimes(db, userId);
    } catch (error) {
      console.error('Error getting user revision times:', error);
      throw error;
    }
  },
  
  /**
   * Get user block times
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User block times
   */
  async getUserBlockTimes(userId) {
    try {
      return await getUserBlockTimes(db, userId);
    } catch (error) {
      console.error('Error getting user block times:', error);
      throw error;
    }
  }
};