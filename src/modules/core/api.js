import { initializeZapt } from '@zapt/zapt-js';
import * as Sentry from '@sentry/browser';

// Initialize Zapt and get supabase client and recordLogin function
const { supabase, recordLogin: zapRecordLogin } = initializeZapt(import.meta.env.VITE_PUBLIC_APP_ID);

// Track login attempts to prevent duplicate recordings
let pendingLoginRecords = {};

/**
 * Record a user login with rate limiting to prevent duplicates
 * @param {string} email - User email
 * @param {string} environment - App environment 
 * @returns {Promise<void>}
 */
async function recordLogin(email, environment) {
  if (!email) {
    console.error('Cannot record login: No email provided');
    return;
  }
  
  // Check if we're already recording this login
  const key = `${email}-${environment}`;
  if (pendingLoginRecords[key]) {
    console.log('Login recording already in progress for:', email);
    return;
  }
  
  // Mark as in progress
  pendingLoginRecords[key] = true;
  
  try {
    await zapRecordLogin(email, environment);
    console.log('@zapt package - User login recorded once');
  } catch (error) {
    console.error('Failed to record login:', error);
    throw error;
  } finally {
    // Clear the pending flag
    delete pendingLoginRecords[key];
  }
}

/**
 * Make an authenticated request to the API
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function makeAuthenticatedRequest(url, options = {}) {
  try {
    // Get current session to add authentication token
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      Sentry.captureException(error);
      throw new Error("Failed to get session. Please log in again.");
    }
    
    if (!session) {
      console.error('No active session found');
      throw new Error("No active session found. Please log in again.");
    }
    
    // Check if session is expired
    const expiresAt = new Date(session.expires_at * 1000);
    if (expiresAt < new Date()) {
      console.error('Session expired');
      throw new Error("Your session has expired. Please log in again.");
    }
    
    // Set up headers with authentication token
    const headers = {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Make the request
    return fetch(url, {
      ...options,
      headers
    });
  } catch (error) {
    console.error('Error making authenticated request:', error);
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Handle API response consistently
 * @param {Response} response - Fetch response
 * @param {string} actionName - Name of the action for error context
 * @returns {Promise<Object>} Parsed response data
 */
async function handleApiResponse(response, actionName = 'API request') {
  if (!response.ok) {
    // Try to get error details from response
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || `${actionName} failed with status ${response.status}`;
    } catch {
      errorMessage = `${actionName} failed with status ${response.status}`;
    }
    
    if (response.status === 401) {
      console.error('Authentication error:', errorMessage);
      // Force a session check on auth errors
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          // Session is gone, try to sign out to clean up
          await supabase.auth.signOut();
        }
      } catch (e) {
        console.error('Error checking session after 401:', e);
      }
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
}

export { 
  supabase,
  recordLogin,
  makeAuthenticatedRequest,
  handleApiResponse
};