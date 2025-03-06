import { eventBus, events as coreEvents } from '../../core/events';
import { events as timetableEvents } from '../events';
import * as Sentry from '@sentry/browser';

/**
 * Initialize the timetable module
 */
export async function initializeTimetable() {
  console.log('Initializing timetable module...');
  
  try {
    // Set up event listeners
    setupEventListeners();
    
    // Log initialization
    console.log('Timetable module initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize timetable module:', error);
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Listen for timetable events
  eventBus.subscribe(timetableEvents.UPDATED, (data) => {
    console.log('Timetable updated:', data);
  });
  
  eventBus.subscribe(timetableEvents.GENERATED, (data) => {
    console.log('Timetable generated:', data);
  });
  
  // Listen for user sign out to clear any cached timetable
  eventBus.subscribe(coreEvents.USER_SIGNED_OUT, () => {
    console.log('User signed out - clearing any cached timetable');
  });
}