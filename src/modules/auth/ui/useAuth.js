import { useAuthState } from '../internal/state';

/**
 * Hook for accessing authentication state and functions
 * @returns {Object} Authentication state and methods
 */
export function useAuth() {
  const authState = useAuthState();
  
  // Return public API only
  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signOut: authState.signOut
  };
}