import { initializeZapt } from '@zapt/zapt-js';
import Sentry from "./_sentry.js";

const { supabase } = initializeZapt(process.env.VITE_PUBLIC_APP_ID);

/**
 * Authenticates a user based on the request's Authorization header
 * @param {Object} req - HTTP request object
 * @returns {Promise<Object>} User object
 */
export async function authenticateUser(req) {
  // Check for authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.error('Missing Authorization header');
    throw new Error('Missing Authorization header');
  }

  // Extract the token
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.error('Invalid Authorization format');
    throw new Error('Invalid Authorization format');
  }

  try {
    // Try to get user with the provided token
    console.log('Fetching user with provided token...');
    const userResponse = await supabase.auth.getUser(token);
    
    // Handle errors or missing user
    if (userResponse.error || !userResponse.data?.user) {
      console.error('Auth error from Supabase:', userResponse.error?.message || 'No user found');
      
      // Token is invalid - check if this is because the session expired
      console.log('Checking if token is expired...');
      
      // Important: Do NOT fall back to session user anymore
      // If the token is invalid, the client should re-authenticate
      
      throw new Error(`Authentication failed: ${userResponse.error?.message || 'Invalid token'}`);
    }
    
    console.log('User authenticated successfully');
    return userResponse.data.user;
  } catch (error) {
    console.error('Authentication error:', error.message);
    Sentry.captureException(error);
    throw error;
  }
}

export { Sentry };