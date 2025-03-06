/**
 * Updates an object without mutating the original
 * @param {Object} obj - Object to update
 * @param {string|Array} path - Path to the property to update
 * @param {*} value - New value
 * @returns {Object} Updated object
 */
export function setIn(obj, path, value) {
  const pathArray = Array.isArray(path) ? path : path.split('.');
  
  if (pathArray.length === 0) return value;
  
  const [head, ...tail] = pathArray;
  
  return {
    ...obj,
    [head]: pathArray.length === 1 
      ? value 
      : setIn(obj[head] || {}, tail, value)
  };
}

/**
 * Updates an item in an array by index
 * @param {Array} array - Array to update
 * @param {number} index - Index of item to update
 * @param {*} newValue - New value
 * @returns {Array} Updated array
 */
export function updateArrayItem(array, index, newValue) {
  if (index < 0 || index >= array.length) {
    return array;
  }
  
  return [
    ...array.slice(0, index),
    newValue,
    ...array.slice(index + 1)
  ];
}

/**
 * Updates items in an array based on a predicate function
 * @param {Array} array - Array to update
 * @param {Function} predicate - Function to determine which items to update
 * @param {Function} updater - Function to update the item
 * @returns {Array} Updated array
 */
export function updateWhere(array, predicate, updater) {
  return array.map(item => 
    predicate(item) ? updater(item) : item
  );
}

/**
 * Merges multiple objects together
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object} Merged object
 */
export function deepMerge(target, ...sources) {
  if (!sources.length) return target;
  
  const source = sources.shift();
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!target[key]) {
          target[key] = {};
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    });
  }
  
  return deepMerge(target, ...sources);
}

/**
 * Checks if a value is an object
 * @param {*} item - Value to check
 * @returns {boolean} Whether the value is an object
 */
function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}