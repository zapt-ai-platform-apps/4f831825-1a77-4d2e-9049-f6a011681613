import { supabase } from '../../core/api';
import * as Sentry from '@sentry/node';

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