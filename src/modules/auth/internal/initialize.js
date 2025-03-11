import { supabase } from '../../core/api';
import { eventBus, events as coreEvents } from '../../core/events';
import { events as authEvents } from '../events';
import * as Sentry from '@sentry/browser';

/**
 * Initialize the authentication module
 */
export async function initializeAuth() {
  console.log('Initializing auth module...');
  
  try {
    // Check if we have an existing session on startup
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      Sentry.captureException(sessionError);
      console.error('Error getting initial session:', sessionError);
    }
    
    if (sessionData?.session) {
      console.log('Found existing session');
    }
    
    // Set up auth state change listener
    setupAuthStateListener();
    
    console.log('Auth module initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize auth module:', error);
    Sentry.captureException(error);
    throw error;
  }
}

/**
 * Set up listener for auth state changes
 */
function setupAuthStateListener() {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
    console.log('Auth event:', event);
    
    // For SIGNED_IN, publish user signed in event
    if (event === 'SIGNED_IN' && newSession?.user) {
      eventBus.publish(coreEvents.USER_SIGNED_IN, { user: newSession.user });
    }
    // For TOKEN_REFRESHED, do nothing special
    else if (event === 'TOKEN_REFRESHED') {
      // Session is automatically updated by Supabase
    }
    // For SIGNED_OUT, publish user signed out event
    else if (event === 'SIGNED_OUT') {
      eventBus.publish(coreEvents.USER_SIGNED_OUT, {});
    }
  });
  
  // Return cleanup function
  return () => {
    subscription.unsubscribe();
  };
}