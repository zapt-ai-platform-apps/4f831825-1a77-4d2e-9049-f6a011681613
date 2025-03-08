import { format, addDays, parseISO, differenceInDays } from 'date-fns';

/**
 * Formats a date to YYYY-MM-DD string
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDateToString(date) {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Creates a date range between start and end dates
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @returns {Array} Array of date strings in YYYY-MM-DD format
 */
export function createDateRange(startDate, endDate) {
  // Parse dates if they're strings
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const days = differenceInDays(end, start) + 1;
  const dateRange = [];
  
  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    dateRange.push(formatDateToString(date));
  }
  
  return dateRange;
}

/**
 * Gets day of week name from a date
 * @param {Date|string} date - Date
 * @returns {string} Day of week name (lowercase)
 */
export function getDayOfWeek(date) {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'EEEE').toLowerCase();
}

/**
 * Checks if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} Whether the dates are the same day
 */
export function areSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}