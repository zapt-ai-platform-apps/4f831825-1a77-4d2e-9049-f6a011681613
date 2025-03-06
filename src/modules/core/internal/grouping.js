/**
 * Groups an array of objects by a specified key
 * @param {Array} array - Array of objects to group
 * @param {string|Function} key - Key to group by or function that returns key
 * @returns {Object} Grouped object where keys are group keys and values are arrays of items
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key];
    
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Partitions an array into two groups based on a predicate function
 * @param {Array} array - Array to partition
 * @param {Function} predicate - Function to determine partition
 * @returns {Array} Array containing two arrays: matching and non-matching items
 */
export function partition(array, predicate) {
  return array.reduce(
    ([pass, fail], item) => {
      return predicate(item) 
        ? [[...pass, item], fail] 
        : [pass, [...fail, item]];
    },
    [[], []]
  );
}

/**
 * Chunks an array into smaller arrays of a specified size
 * @param {Array} array - Array to chunk
 * @param {number} size - Size of each chunk
 * @returns {Array} Array of chunks
 */
export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Counts occurrences of values in an array
 * @param {Array} array - Array to count
 * @returns {Object} Object with counts
 */
export function countOccurrences(array) {
  return array.reduce((counts, item) => {
    counts[item] = (counts[item] || 0) + 1;
    return counts;
  }, {});
}