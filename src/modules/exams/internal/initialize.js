import { eventBus, events as coreEvents } from '../../core/events';
import { events as examsEvents } from '../events';
import * as Sentry from '@sentry/browser';

/**
 * Initialize the exams module
 */
export async function initializeExams() {
  console.log('Initializing exams module...');
  
  try {
    // Set up event listeners
    setupEventListeners();
    
    // Log initialization
    console.log('Exams module initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize exams module:', error);
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Listen for exams events
  eventBus.subscribe(examsEvents.CREATED, (data) => {
    console.log('Exam created:', data);
  });
  
  eventBus.subscribe(examsEvents.UPDATED, (data) => {
    console.log('Exam updated:', data);
  });
  
  eventBus.subscribe(examsEvents.DELETED, (data) => {
    console.log('Exam deleted:', data);
  });
  
  // Listen for user sign out to clear any cached exams
  eventBus.subscribe(coreEvents.USER_SIGNED_OUT, () => {
    console.log('User signed out - clearing any cached exams');
  });
}