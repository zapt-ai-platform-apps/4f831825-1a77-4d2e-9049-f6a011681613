import { eventBus, events as coreEvents } from '../../core/events';
import { events as preferencesEvents } from '../events';
import * as Sentry from '@sentry/browser';

/**
 * Initialize the preferences module
 */
export async function initializePreferences() {
  console.log('Initializing preferences module...');
  
  try {
    // Set up event listeners
    setupEventListeners();
    
    // Log initialization
    console.log('Preferences module initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize preferences module:', error);
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Listen for preferences updated events
  eventBus.subscribe(preferencesEvents.UPDATED, (data) => {
    console.log('Preferences updated:', data);
  });
  
  // Listen for user sign out to clear any cached preferences
  eventBus.subscribe(coreEvents.USER_SIGNED_OUT, () => {
    console.log('User signed out - clearing any cached preferences');
  });
}