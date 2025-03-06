import { initializeZapt } from '@zapt/zapt-js';

/**
 * Supabase client initialized with ZAPT
 * This is the main integration point with Supabase services
 */
export const { supabase, recordLogin } = initializeZapt(import.meta.env.VITE_PUBLIC_APP_ID);

/**
 * Makes an authenticated request to a backend API endpoint
 * @param {string} url - The endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export async function makeAuthenticatedRequest(url, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No active session found');
  }
  
  const headers = {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  return fetch(url, {
    ...options,
    headers
  });
}

/**
 * Handles API response, parsing JSON and checking for errors
 * @param {Response} response - Fetch response object
 * @param {string} errorContext - Context for error message
 * @returns {Promise<any>} - Response data
 */
export async function handleApiResponse(response, errorContext = 'API request') {
  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || `${errorContext} failed: ${response.status}`;
    } catch (e) {
      errorMessage = `${errorContext} failed: ${response.status}`;
    }
    throw new Error(errorMessage);
  }
  
  return response.json();
}