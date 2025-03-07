import { BLOCK_ORDER, DEFAULT_BLOCK_TIMES } from './constants';

/**
 * Creates a timetable session object
 * @param {string} date - Date string in format YYYY-MM-DD
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {string} subject - Subject name
 * @param {Object} blockTimes - User defined block times
 * @returns {Object} Session object
 */
export function createSession(date, block, subject, blockTimes = {}) {
  const times = getBlockTimes(block, blockTimes);
  
  return {
    date,
    block,
    subject,
    startTime: times.startTime,
    endTime: times.endTime,
    isUserCreated: false
  };
}

/**
 * Gets start and end times for a block
 * @param {string} block - Block name
 * @param {Object} blockTimes - User defined block times
 * @returns {Object} Start and end times
 */
function getBlockTimes(block, blockTimes) {
  // Check if user has defined times for this block
  if (blockTimes && blockTimes[block] && 
      blockTimes[block].startTime && blockTimes[block].endTime) {
    return {
      startTime: blockTimes[block].startTime,
      endTime: blockTimes[block].endTime
    };
  }
  
  // Use default times if not specified
  return {
    startTime: DEFAULT_BLOCK_TIMES[block]?.startTime || '09:00',
    endTime: DEFAULT_BLOCK_TIMES[block]?.endTime || '13:00'
  };
}

/**
 * Gets the block for a given time
 * @param {string} time - Time string in format HH:MM
 * @param {Object} blockTimes - User defined block times
 * @returns {string} Block name
 */
export function getBlockForTime(time, blockTimes = {}) {
  const blocks = ['Morning', 'Afternoon', 'Evening'];
  
  // Try to find a matching block
  for (const block of blocks) {
    const times = getBlockTimes(block, blockTimes);
    if (time >= times.startTime && time <= times.endTime) {
      return block;
    }
  }
  
  // Default to morning if no match found
  return 'Morning';
}

/**
 * Compare two blocks to determine order
 * @param {string} blockA - First block
 * @param {string} blockB - Second block
 * @returns {number} Comparison result (-1, 0, 1)
 */
export function compareBlocks(blockA, blockB) {
  const orderA = BLOCK_ORDER[blockA] || 999;
  const orderB = BLOCK_ORDER[blockB] || 999;
  return orderA - orderB;
}