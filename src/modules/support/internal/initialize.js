import { eventBus, events as coreEvents } from '../../core/events';
import { events as supportEvents } from '../events';
import * as Sentry from '@sentry/browser';

/**
 * Initialize the support module
 */
export async function initializeSupport() {
  console.log('Initializing support module...');
  
  try {
    // Set up event listeners
    setupEventListeners();
    
    // Log module initialization
    console.log('Support module initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize support module:', error);
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Listen for user sign out to disconnect support chat
  eventBus.subscribe(coreEvents.USER_SIGNED_OUT, () => {
    console.log('User signed out - cleaning up support resources');
  });
}