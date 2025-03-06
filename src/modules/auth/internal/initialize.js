import { supabase, recordLogin } from '../../core/api';
import { eventBus, events as coreEvents } from '../../core/events';
import { events as authEvents } from '../events';
import * as Sentry from '@sentry/browser';

/**
 * Flag to track if we've recorded login
 */
let hasRecordedLogin = false;

/**
 * Flag to track if we have an active session
 */
let hasSession = false;

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
      hasSession = true;
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
    console.log('Auth event:', event, 'Has session:', hasSession);
    
    // For SIGNED_IN, only update session if we don't have one
    if (event === 'SIGNED_IN') {
      if (!hasSession) {
        hasSession = true;
        
        if (newSession?.user?.email) {
          eventBus.publish(coreEvents.USER_SIGNED_IN, { user: newSession.user });
          
          // Record login for analytics, but only once
          if (!hasRecordedLogin) {
            try {
              await recordLogin(newSession.user.email, import.meta.env.VITE_PUBLIC_APP_ENV);
              hasRecordedLogin = true;
              console.log('Recorded login for user:', newSession.user.email);
            } catch (error) {
              console.error('Failed to record login:', error);
              Sentry.captureException(error);
            }
          }
        }
      } else {
        console.log('Already have session, ignoring SIGNED_IN event');
      }
    }
    // For TOKEN_REFRESHED, always update the session
    else if (event === 'TOKEN_REFRESHED') {
      hasSession = true;
    }
    // For SIGNED_OUT, clear the session
    else if (event === 'SIGNED_OUT') {
      hasSession = false;
      hasRecordedLogin = false;
      eventBus.publish(coreEvents.USER_SIGNED_OUT, {});
    }
  });
  
  // Return cleanup function
  return () => {
    subscription.unsubscribe();
  };
}