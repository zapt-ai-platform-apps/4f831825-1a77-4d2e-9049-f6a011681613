import { useState, useEffect, useRef } from 'react';
import { supabase, recordLogin } from '../../core/api';
import { eventBus } from '../../core/events';
import { events } from '../events';
import * as Sentry from '@sentry/browser';

// Module-level singleton to track login recording
let hasRecordedLoginGlobally = false;

/**
 * Auth state management hook
 * @returns {Object} Authentication state and controls
 */
export function useAuthState() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasSessionRef = useRef(false);
  const sessionRefreshInterval = useRef(null);
  
  // Use this function to update session so we also update our ref
  const updateSession = (newSession) => {
    setSession(newSession);
    hasSessionRef.current = newSession !== null;
  };

  // Explicit check if session is expired
  const isSessionExpired = (session) => {
    if (!session || !session.expires_at) return true;
    
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    
    // Consider expired 30 seconds before actual expiry for safety
    return expiresAt.getTime() - 30000 < now.getTime();
  };

  // Function to handle session expiration
  const handleExpiredSession = async () => {
    console.log('Session expired, signing out user');
    updateSession(null);
    eventBus.publish(events.SIGNED_OUT, {});
    hasRecordedLoginGlobally = false;
    
    try {
      // Force sign out to clear any stale session data
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during forced sign out:', error);
      Sentry.captureException(error);
    }
  };
  
  // Check session validity and refresh if needed
  const verifySession = async () => {
    if (!hasSessionRef.current) return;
    
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error verifying session:', error);
        Sentry.captureException(error);
        await handleExpiredSession();
        return;
      }
      
      if (!data.session || isSessionExpired(data.session)) {
        console.log('Session verification failed - no valid session found');
        await handleExpiredSession();
        return;
      }
      
      // Session is still valid, update it in state to ensure we have latest
      updateSession(data.session);
    } catch (error) {
      console.error('Error in session verification:', error);
      Sentry.captureException(error);
    }
  };
  
  useEffect(() => {
    // Check active session on initial mount
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (data.session && !isSessionExpired(data.session)) {
          updateSession(data.session);
          hasSessionRef.current = true;
        } else if (data.session) {
          // We have a session but it's expired
          console.log('Initial session check found expired session');
          await handleExpiredSession();
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        Sentry.captureException(error);
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Set up periodic session verification (every 5 minutes)
    sessionRefreshInterval.current = setInterval(verifySession, 5 * 60 * 1000);
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state change:', event);
      
      // For SIGNED_IN, update session if we don't have one
      if (event === 'SIGNED_IN') {
        if (!hasSessionRef.current) {
          updateSession(newSession);
          if (newSession?.user?.email) {
            eventBus.publish(events.SIGNED_IN, { user: newSession.user });
          }
        }
      }
      // For TOKEN_REFRESHED, always update the session
      else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed, updating session');
        updateSession(newSession);
      }
      // For SIGNED_OUT, clear the session
      else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        updateSession(null);
        eventBus.publish(events.SIGNED_OUT, {});
        hasRecordedLoginGlobally = false;
      }
      // For USER_UPDATED, update the session
      else if (event === 'USER_UPDATED' && newSession) {
        console.log('User updated, updating session');
        updateSession(newSession);
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
      if (sessionRefreshInterval.current) {
        clearInterval(sessionRefreshInterval.current);
      }
    };
  }, []);
  
  // Handle login recording - only once per session across the app
  useEffect(() => {
    const recordUserLogin = async () => {
      if (session?.user?.email && !hasRecordedLoginGlobally) {
        try {
          // Set flag before API call to prevent race conditions
          hasRecordedLoginGlobally = true;
          
          await recordLogin(session.user.email, import.meta.env.VITE_PUBLIC_APP_ENV);
          console.log('Login recorded for user:', session.user.email);
        } catch (error) {
          console.error('Failed to record login:', error);
          Sentry.captureException(error);
          // Don't reset the flag on error - we don't want to keep trying
        }
      }
    };
    
    recordUserLogin();
  }, [session]);
  
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      Sentry.captureException(error);
      throw error;
    }
  };
  
  return {
    session,
    user: session?.user || null,
    loading,
    signOut,
  };
}