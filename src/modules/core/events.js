/**
 * Core application events that can be subscribed to by any module
 */
export const events = {
  // Auth events
  USER_SIGNED_IN: 'auth/user_signed_in',
  USER_SIGNED_OUT: 'auth/user_signed_out',
  
  // Preference events
  PREFERENCES_UPDATED: 'preferences/updated',
  
  // Exam events
  EXAM_CREATED: 'exams/created',
  EXAM_UPDATED: 'exams/updated',
  EXAM_DELETED: 'exams/deleted',
  
  // Timetable events
  TIMETABLE_GENERATED: 'timetable/generated',
  TIMETABLE_UPDATED: 'timetable/updated',
};

/**
 * EventBus for application-wide pub/sub communication
 */
export class EventBus {
  subscribers = {};

  /**
   * Subscribe to an event
   * @param {string} event - Event name to subscribe to
   * @param {Function} callback - Callback function when event is published
   * @returns {Function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(callback);
    
    // Return unsubscribe function
    return () => this.unsubscribe(event, callback);
  }

  /**
   * Publish an event with data
   * @param {string} event - Event name to publish
   * @param {any} data - Data to pass to subscribers
   */
  publish(event, data) {
    console.log(`[EventBus] Publishing event: ${event}`, data);
    if (!this.subscribers[event]) return;
    
    this.subscribers[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name to unsubscribe from
   * @param {Function} callback - Callback to remove
   */
  unsubscribe(event, callback) {
    if (!this.subscribers[event]) return;
    
    this.subscribers[event] = this.subscribers[event]
      .filter(cb => cb !== callback);
  }
}

export const eventBus = new EventBus();