import { parseISO } from 'date-fns';
import { BLOCK_ORDER } from '../constants';

/**
 * Sorts sessions chronologically by date and then by block
 * @param {Array} sessions - Array of session objects
 * @returns {Array} Sorted sessions
 */
export function sortSessionsChronologically(sessions) {
  return [...sessions].sort((a, b) => {
    // First compare by date
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    const dateDiff = dateA.getTime() - dateB.getTime();
    
    if (dateDiff !== 0) {
      return dateDiff;
    }
    
    // If dates are equal, compare by block
    return BLOCK_ORDER[a.block] - BLOCK_ORDER[b.block];
  });
}

/**
 * Sorts sessions in reverse chronological order (latest first)
 * @param {Array} sessions - Array of session objects
 * @returns {Array} Sorted sessions
 */
export function sortSessionsReverseChronologically(sessions) {
  return [...sessions].sort((a, b) => {
    // First compare by date
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);
    const dateDiff = dateB.getTime() - dateA.getTime();
    
    if (dateDiff !== 0) {
      return dateDiff;
    }
    
    // If dates are equal, compare by block
    return BLOCK_ORDER[b.block] - BLOCK_ORDER[a.block];
  });
}

/**
 * Groups sessions by date
 * @param {Array} sessions - Array of session objects
 * @returns {Object} Sessions grouped by date
 */
export function groupSessionsByDate(sessions) {
  return sessions.reduce((grouped, session) => {
    if (!grouped[session.date]) {
      grouped[session.date] = [];
    }
    grouped[session.date].push(session);
    return grouped;
  }, {});
}