import { initializeZapt } from '@zapt/zapt-js';
import Sentry from "./_sentry.js";

const { supabase } = initializeZapt(process.env.VITE_PUBLIC_APP_ID);

/**
 * Authenticates a user based on the request's Authorization header
 * @param {Object} req - HTTP request object
 * @returns {Promise<Object>} User object
 */
export async function authenticateUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }

  const token = authHeader.split(' ')[1];
  
  // Add more robustness to the authentication process
  try {
    const response = await supabase.auth.getUser(token);
    
    // Debug log to help diagnose issues
    console.log('Auth response status:', response && response.data ? 'has data' : 'missing data');
    
    // Check if response has the expected structure
    if (!response || !response.data) {
      console.error('Invalid auth response structure');
      throw new Error('Invalid authentication response structure');
    }
    
    // Check if user exists in the response
    if (!response.data.user) {
      console.error('Auth session missing! User not found in response');
      throw new Error('Auth session missing! User not found in response');
    }
    
    // Check for errors
    if (response.error) {
      Sentry.captureException(response.error);
      throw new Error(`Invalid token: ${response.error.message}`);
    }
    
    return response.data.user;
  } catch (error) {
    console.error('Authentication error:', error.message);
    Sentry.captureException(error);
    throw error;
  }
}

export { Sentry };