/**
 * Support module public API
 * Provides functionality for user support interactions
 */
export const api = {
  /**
   * Initializes the customer support chat connection
   * @param {string} email - User's email
   * @returns {Promise<Object>} Customer support connection data
   */
  async initializeCustomerSupport(email) {
    try {
      const response = await fetch('/api/customerSupport', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize customer support');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error initializing support:', error);
      throw error;
    }
  }
};