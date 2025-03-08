/**
 * Creates a session object for the timetable
 * @param {string} date - Date string in YYYY-MM-DD format
 * @param {string} block - Block name (Morning, Afternoon, Evening)
 * @param {string} subject - Subject name
 * @param {Object} blockTimes - User block time preferences
 * @returns {Object} Session object
 */
export function createSession(date, block, subject, blockTimes = {}) {
  const blockInfo = getBlockTimeInfo(block, blockTimes);
  
  return {
    date,
    block,
    subject,
    startTime: blockInfo.startTime,
    endTime: blockInfo.endTime,
    isUserCreated: false
  };
}

/**
 * Gets start and end times for a block
 * @param {string} block - Block name
 * @param {Object} blockTimes - User block time preferences
 * @returns {Object} Start and end times
 */
export function getBlockTimeInfo(block, blockTimes = {}) {
  const defaultTimes = {
    Morning: { startTime: '09:00', endTime: '13:00' },
    Afternoon: { startTime: '14:00', endTime: '17:00' },
    Evening: { startTime: '19:00', endTime: '21:00' }
  };
  
  const startTime = blockTimes?.[block]?.startTime || defaultTimes[block].startTime;
  const endTime = blockTimes?.[block]?.endTime || defaultTimes[block].endTime;
  
  return { startTime, endTime };
}