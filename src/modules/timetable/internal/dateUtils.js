import { format, addDays, parseISO, differenceInDays } from 'date-fns';

/**
 * Formats a date to YYYY-MM-DD string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateToString(date) {
  if (!date) {
    console.error('formatDateToString called with invalid date');
    return '';
  }
  
  try {
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date to string:', error);
    return '';
  }
}

/**
 * Creates a date range between start and end dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Array} Array of date strings in YYYY-MM-DD format
 */
export function createDateRange(startDate, endDate) {
  try {
    // Parse dates if they're strings
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    
    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('Invalid date in createDateRange', { startDate, endDate });
      return [];
    }
    
    // Handle case where end is before start
    if (end < start) {
      console.warn('End date is before start date in createDateRange, swapping them');
      return createDateRange(end, start);
    }
    
    const days = differenceInDays(end, start) + 1;
    const dateRange = [];
    
    for (let i = 0; i < days; i++) {
      const date = addDays(new Date(start), i);
      dateRange.push(formatDateToString(date));
    }
    
    return dateRange;
  } catch (error) {
    console.error('Error creating date range:', error);
    return [];
  }
}

/**
 * Gets day of week name from a date
 * @param {Date|string} date - Date
 * @returns {string} Day of week name (lowercase)
 */
export function getDayOfWeek(date) {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date in getDayOfWeek', { date });
      return 'monday'; // Default to Monday as fallback
    }
    
    return format(dateObj, 'EEEE').toLowerCase();
  } catch (error) {
    console.error('Error getting day of week:', error);
    return 'monday'; // Default to Monday as fallback
  }
}

/**
 * Checks if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} Whether the dates are the same day
 */
export function areSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  
  try {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
      return false;
    }
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  } catch (error) {
    console.error('Error comparing dates:', error);
    return false;
  }
}