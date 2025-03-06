import { api as examsApi } from '../api';
import { eventBus } from '../../core/events';
import { events } from '../events';
import * as Sentry from '@sentry/browser';

/**
 * Validates exam data before saving
 * @param {Object} exam - The exam data to validate
 * @returns {boolean} - True if valid, throws error if not
 */
export function validateExamInput(exam) {
  // Check required fields
  if (!exam.subject) {
    throw new Error('Subject is required');
  }
  
  if (!exam.examDate) {
    throw new Error('Exam date is required');
  }
  
  return true;
}

/**
 * Save or update an exam
 * @param {Object} exam - The exam to save or update
 * @param {Object|null} editExam - The original exam data if updating
 * @returns {Promise<Object>} Result message
 */
export async function saveOrUpdateExam(exam, editExam = null) {
  try {
    // Validate input
    validateExamInput(exam);
    
    if (editExam) {
      // Update existing exam
      const examWithId = {
        ...exam,
        id: editExam.id
      };
      
      await examsApi.updateExam(examWithId);
      
      // Publish exam updated event
      eventBus.publish(events.UPDATED, { exam: examWithId });
    } else {
      // Create new exam
      await examsApi.saveExam(exam);
      
      // Publish exam created event
      eventBus.publish(events.CREATED, { exam });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in exams service:', error);
    Sentry.captureException(error);
    
    // Publish error event
    eventBus.publish(events.ERROR, { error: error.message });
    
    throw error;
  }
}

/**
 * Delete an exam
 * @param {number} id - The ID of the exam to delete
 * @returns {Promise<Object>} Result message
 */
export async function deleteExam(id) {
  try {
    await examsApi.deleteExam(id);
    
    // Publish exam deleted event
    eventBus.publish(events.DELETED, { id });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting exam:', error);
    Sentry.captureException(error);
    
    // Publish error event
    eventBus.publish(events.ERROR, { error: error.message });
    
    throw error;
  }
}

/**
 * Generate timetable based on exams and preferences
 * @returns {Promise<Object>} Result message
 */
export async function generateTimetable() {
  try {
    const response = await fetch('/api/generateTimetable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error generating timetable');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error generating timetable:', error);
    Sentry.captureException(error);
    throw error;
  }
}