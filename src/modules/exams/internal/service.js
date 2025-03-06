import { api as examsApi } from '../api';
import { eventBus } from '../../core/events';
import { events } from '../events';
import * as Sentry from '@sentry/browser';
import { validateExam } from '../validators';

/**
 * Validates exam data before saving
 * @param {Object} exam - The exam data to validate
 * @returns {boolean} - True if valid, throws error if not
 */
export function validateExamInput(exam) {
  // Check if exam object exists
  if (!exam) {
    console.error('Validation failed: Exam data is missing', exam);
    throw new Error('Exam data is missing');
  }
  
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
    console.log('saveOrUpdateExam called with:', { exam, editExam });
    
    // Safely handle potential undefined or null exam input
    if (!exam) {
      console.error('Exam data is missing in saveOrUpdateExam');
      return { success: false, error: 'Exam data is missing' };
    }
    
    // Make a deep copy of exam data to prevent reference issues
    const examData = JSON.parse(JSON.stringify(exam));
    
    // Validate input
    validateExamInput(examData);
    
    if (editExam) {
      // Update existing exam
      const examWithId = {
        ...examData,
        id: editExam.id
      };
      
      console.log('Updating exam:', examWithId);
      await examsApi.updateExam(examWithId);
      
      // Publish exam updated event
      eventBus.publish(events.UPDATED, { exam: examWithId });
      console.log('Exam updated:', examWithId);
    } else {
      // Create new exam
      console.log('Creating new exam:', examData);
      await examsApi.saveExam(examData);
      
      // Publish exam created event
      eventBus.publish(events.CREATED, { exam: examData });
      console.log('Exam created:', examData);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in exams service:', error);
    Sentry.captureException(error);
    
    // Publish error event
    eventBus.publish(events.ERROR, { error: error.message });
    
    // Return error information instead of throwing
    return { success: false, error: error.message };
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
    console.log("Generating timetable...");
    const response = await fetch('/api/generateTimetable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorText = errorData?.error || await response.text();
      throw new Error(errorText || 'Error generating timetable');
    }
    
    console.log("Timetable generated successfully");
    return { success: true };
  } catch (error) {
    console.error('Error generating timetable:', error);
    Sentry.captureException(error);
    throw error;
  }
}