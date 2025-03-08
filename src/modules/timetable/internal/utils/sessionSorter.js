import { parseISO } from 'date-fns';
import { BLOCK_ORDER } from '../constants';

/**
 * Sorts sessions by date and block
 * @param {Array} sessions - Array of session objects
 * @returns {Array} Sorted sessions
 */
export function sortSessionsByBlock(sessions) {
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