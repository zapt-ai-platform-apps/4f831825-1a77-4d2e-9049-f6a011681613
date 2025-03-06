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
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error) {
    Sentry.captureException(error);
    throw new Error('Invalid token');
  }

  return user;
}

export { Sentry };