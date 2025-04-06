import React from 'react';
import { format } from 'date-fns';

/**
 * Date picker component for selecting the start date of the revision period
 * 
 * @param {Object} props Component props
 * @param {string} props.value Current date value in YYYY-MM-DD format
 * @param {Function} props.onChange Handler for date changes
 * @param {string} props.error Error message to display
 * @returns {React.ReactElement}
 */
const StartDatePicker = ({ value, onChange, error }) => {
  // Get today's date in YYYY-MM-DD format for min attribute
  const today = format(new Date(), 'yyyy-MM-dd');
  
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-1">
        When would you like to start revising?
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={today} // Set minimum date to today
        className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary box-border
          ${error ? 'border-destructive' : 'border-gray-300 dark:border-gray-700'}
          dark:bg-gray-800 dark:text-white`}
      />
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        This is the date you will start your revision schedule
      </p>
    </div>
  );
};

export default StartDatePicker;