import { initializeZapt } from '@zapt/zapt-js';

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

export { 
  supabase,
  recordLogin
};