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
    // Check for active session first
    console.log('Checking for active session...');
    const sessionResponse = await supabase.auth.getSession();
    const sessionData = sessionResponse.data || {};
    
    const sessionActive = sessionData.session && 
                          sessionData.session.expires_at && 
                          new Date(sessionData.session.expires_at * 1000) > new Date();
    
    console.log('Session status:', {
      hasSession: !!sessionData.session,
      isActive: sessionActive
    });
    
    // Try to get user with the provided token
    console.log('Fetching user with provided token...');
    const userResponse = await supabase.auth.getUser(token);
    
    // Handle errors first
    if (userResponse.error) {
      console.error('Auth error from Supabase:', userResponse.error);
      Sentry.captureException(userResponse.error);
      throw new Error(`Authentication failed: ${userResponse.error.message}`);
    }
    
    const userData = userResponse.data || {};
    
    // If we have a user in the response, return it
    if (userData.user) {
      console.log('User authenticated successfully');
      return userData.user;
    }
    
    // If token didn't get a user but we have an active session with user, use that as fallback
    if (sessionActive && sessionData.session && sessionData.session.user) {
      console.log('Using session user as fallback');
      return sessionData.session.user;
    }
    
    // No user found in response or session
    console.error('No valid user found in auth response or session');
    throw new Error('Authentication failed: User not found in response');
  } catch (error) {
    console.error('Authentication error:', error.message);
    Sentry.captureException(error);
    throw error;
  }
}

export { Sentry };