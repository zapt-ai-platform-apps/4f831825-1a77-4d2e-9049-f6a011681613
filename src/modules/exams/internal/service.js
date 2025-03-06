import { api as examsApi } from '../api';
import { eventBus } from '../../core/events';
import { events } from '../events';
import * as Sentry from '@sentry/browser';
import { validateExam } from '../validators';
import { supabase } from '../../core/api';
import { generateTimetableClient } from '../../timetable/internal/clientTimetableGenerator';
import { api as preferencesApi } from '../../preferences/api';

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
    
    let result;
    
    if (editExam) {
      // Update existing exam
      const examWithId = {
        ...examData,
        id: editExam.id
      };
      
      console.log('Updating exam:', examWithId);
      result = await examsApi.updateExam(examWithId);
      
      // Publish exam updated event after successful API call
      eventBus.publish(events.UPDATED, { exam: examWithId });
      console.log('Exam updated:', examWithId);
    } else {
      // Create new exam
      console.log('Creating new exam:', examData);
      result = await examsApi.saveExam(examData);
      
      // Publish exam created event after successful API call
      eventBus.publish(events.CREATED, { exam: examData });
      console.log('Exam created:', examData);
    }
    
    return { success: true, ...result };
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
    const result = await examsApi.deleteExam(id);
    
    // Publish exam deleted event after successful API call
    eventBus.publish(events.DELETED, { id });
    
    return { success: true, ...result };
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
    
    // Get the current session to add authentication token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error("No active session found. Please log in again.");
    }
    
    // Get user exams
    const exams = await examsApi.getExams();
    if (!exams || exams.length === 0) {
      throw new Error("No exams found. Please add exams first.");
    }
    
    // Get user preferences
    const preferences = await preferencesApi.getPreferences();
    if (!preferences) {
      throw new Error("No preferences found. Please set your revision preferences first.");
    }
    
    // Generate timetable on the client side
    const timetable = await generateTimetableClient(
      exams,
      preferences.startDate,
      preferences.revisionTimes,
      preferences.blockTimes
    );
    
    if (timetable.length === 0) {
      throw new Error("Could not generate a viable timetable. Please check your exams and revision preferences.");
    }
    
    // Save the generated timetable using the API
    const response = await fetch('/api/saveTimetable', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: timetable
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => {
        console.error("Failed to parse error response as JSON");
        return null;
      });
      
      let errorMessage = 'Error saving timetable';
      
      if (errorData && errorData.error) {
        errorMessage = errorData.error;
        console.error("Timetable save error:", errorMessage);
      } else {
        // Try to get text response if JSON parsing failed
        const errorText = await response.text().catch(e => {
          console.error("Failed to get error response as text:", e);
          return null;
        });
        
        if (errorText) {
          errorMessage = errorText;
          console.error("Timetable save error (text):", errorText);
        }
      }
      
      // Log detailed error information
      console.error("Failed to save timetable:", {
        status: response.status,
        statusText: response.statusText,
        errorMessage: errorMessage
      });
      
      // Report to Sentry with details
      Sentry.captureException(new Error(errorMessage), {
        extra: {
          status: response.status,
          statusText: response.statusText
        }
      });
      
      throw new Error(errorMessage);
    }
    
    console.log("Timetable generated and saved successfully");
    return { success: true };
  } catch (error) {
    console.error('Error generating timetable:', error);
    Sentry.captureException(error);
    return { success: false, error: error.message || 'Error generating timetable' };
  }
}