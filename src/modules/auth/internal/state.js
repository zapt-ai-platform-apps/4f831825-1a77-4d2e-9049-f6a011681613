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
  
  // Use this function to update session so we also update our ref
  const updateSession = (newSession) => {
    setSession(newSession);
    hasSessionRef.current = newSession !== null;
  };
  
  useEffect(() => {
    // Check active session on initial mount
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        // Set initial session
        updateSession(data.session);
        if (data.session) {
          hasSessionRef.current = true;
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        Sentry.captureException(error);
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      // For SIGNED_IN, only update session if we don't have one
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
        updateSession(newSession);
      }
      // For SIGNED_OUT, clear the session
      else if (event === 'SIGNED_OUT') {
        updateSession(null);
        eventBus.publish(events.SIGNED_OUT, {});
        hasRecordedLoginGlobally = false; // Reset for next login
      }
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
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