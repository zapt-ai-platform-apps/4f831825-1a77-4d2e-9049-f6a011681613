import { supabase, recordLogin } from '@/modules/core/api';
import { validateUser } from './validators';
import { eventBus, events } from '@/modules/core/events';

/**
 * Authentication module public API
 * Provides functionality for user authentication and session management
 */
export const api = {
  /**
   * Get the current session if available
   * @returns {Promise<Object|null>} The current session or null
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      throw error;
    }
    
    return data.session;
  },
  
  /**
   * Get the current authenticated user
   * @returns {Promise<Object|null>} The current user or null
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting user:', error);
      throw error;
    }
    
    if (!data.user) return null;
    
    // Validate user before returning
    return validateUser(data.user, {
      actionName: 'getCurrentUser',
      location: 'auth/api.js',
      direction: 'outgoing',
      moduleFrom: 'auth',
      moduleTo: 'client'
    });
  },
  
  /**
   * Get a user by token
   * @param {string} token - Auth token
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserByToken(token) {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('Error getting user by token:', error);
      throw error;
    }
    
    return data.user;
  },
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
    
    // Publish the sign out event
    eventBus.publish(events.USER_SIGNED_OUT, {});
  }
};