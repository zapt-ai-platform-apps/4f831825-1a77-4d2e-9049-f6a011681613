import { makeAuthenticatedRequest, handleApiResponse } from '../core/api';
import { validateExam } from './validators';
import { eventBus, events } from '../core/events';

/**
 * Exams module public API
 */
export const api = {
  /**
   * Get user exams
   * @returns {Promise<Array>} List of exams
   */
  async getExams() {
    try {
      const response = await makeAuthenticatedRequest('/api/getExams');
      const { data } = await handleApiResponse(response, 'Fetching exams');
      
      console.log('[Exams API] Retrieved exams:', data);
      
      return data || [];
    } catch (error) {
      console.error('Error fetching exams:', error);
      throw error;
    }
  },
  
  /**
   * Save a new exam
   * @param {Object} exam - The exam to save
   * @returns {Promise<Object>} Result message
   */
  async saveExam(exam) {
    try {
      // Validate exam before saving
      const validatedExam = validateExam(exam, {
        actionName: 'saveExam',
        location: 'exams/api.js',
        direction: 'incoming',
        moduleFrom: 'client',
        moduleTo: 'exams'
      });
      
      console.log('[Exams API] Saving exam:', validatedExam);
      
      const response = await makeAuthenticatedRequest('/api/saveExams', {
        method: 'POST',
        body: JSON.stringify({ data: validatedExam })
      });
      
      const result = await handleApiResponse(response, 'Saving exam');
      
      // Note: Event publishing moved to service layer to prevent duplication
      
      return result;
    } catch (error) {
      console.error('Error saving exam:', error);
      throw error;
    }
  },
  
  /**
   * Update an existing exam
   * @param {Object} exam - The exam to update
   * @returns {Promise<Object>} Result message
   */
  async updateExam(exam) {
    try {
      if (!exam.id) {
        throw new Error('Exam ID is required for update');
      }
      
      // Validate exam before updating
      const validatedExam = validateExam(exam, {
        actionName: 'updateExam',
        location: 'exams/api.js',
        direction: 'incoming',
        moduleFrom: 'client',
        moduleTo: 'exams'
      });
      
      const response = await makeAuthenticatedRequest('/api/updateExam', {
        method: 'PUT',
        body: JSON.stringify({ data: validatedExam })
      });
      
      const result = await handleApiResponse(response, 'Updating exam');
      
      // Note: Event publishing moved to service layer to prevent duplication
      
      return result;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  },
  
  /**
   * Delete an exam
   * @param {number} id - The ID of the exam to delete
   * @returns {Promise<Object>} Result message
   */
  async deleteExam(id) {
    try {
      const response = await makeAuthenticatedRequest('/api/deleteExam', {
        method: 'DELETE',
        body: JSON.stringify({ id })
      });
      
      const result = await handleApiResponse(response, 'Deleting exam');
      
      // Note: Event publishing moved to service layer to prevent duplication
      
      return result;
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  }
};