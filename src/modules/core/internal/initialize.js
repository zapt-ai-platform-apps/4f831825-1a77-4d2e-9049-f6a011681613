import * as Sentry from '@sentry/browser';
import { eventBus, events } from '../events';

/**
 * Initialize the core module
 * This sets up basic infrastructure needed by other modules
 */
export async function initializeCore() {
  console.log('Initializing core module...');
  
  try {
    // Set up global error handling
    setupGlobalErrorHandling();
    
    // Log module initialization
    eventBus.publish('core/initialized', { timestamp: new Date() });
    
    console.log('Core module initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize core module:', error);
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Set up global error handling
 */
function setupGlobalErrorHandling() {
  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    Sentry.captureException(event.reason);
  });
  
  // Capture uncaught exceptions
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    Sentry.captureException(event.error);
  });
}