/**
 * Creates a timetable session object
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {string} subject - Subject name
 * @param {Object} blockTimes - User block time preferences
 * @param {boolean} isUserCreated - Whether the session was created by the user
 * @returns {Object} Session object
 */
export function createSession(date, block, subject, blockTimes, isUserCreated = false) {
  if (!date) {
    console.error('createSession called without date parameter');
    throw new Error('Date is required for session creation');
  }
  
  const startTime = getBlockTime(block, blockTimes, 'startTime');
  const endTime = getBlockTime(block, blockTimes, 'endTime');
  
  return {
    date,
    block,
    subject,
    startTime,
    endTime,
    isUserCreated
  };
}

/**
 * Gets the start or end time for a block
 * @param {string} block - Block name
 * @param {Object} blockTimes - User block time preferences
 * @param {string} timeType - 'startTime' or 'endTime'
 * @returns {string} Time string in HH:MM format
 */
function getBlockTime(block, blockTimes, timeType) {
  if (blockTimes && blockTimes[block] && blockTimes[block][timeType]) {
    return blockTimes[block][timeType];
  }
  
  // Default times if not specified
  const defaults = {
    Morning: { startTime: '09:00', endTime: '13:00' },
    Afternoon: { startTime: '14:00', endTime: '17:00' },
    Evening: { startTime: '19:00', endTime: '21:00' }
  };
  
  return defaults[block][timeType];
}