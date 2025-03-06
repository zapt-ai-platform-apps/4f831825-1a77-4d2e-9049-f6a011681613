import { api as authApi } from "@/modules/auth/api.js";
import Sentry from "@/modules/core/internal/sentry.js";

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
  const user = await authApi.getUserByToken(token);
  
  if (!user) {
    throw new Error('Invalid token');
  }

  return user;
}

export { Sentry };