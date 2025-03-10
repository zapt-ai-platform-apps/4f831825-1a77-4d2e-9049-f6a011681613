import React from 'react';

/**
 * Component for selecting the start date
 * @param {Object} props - Component props
 * @param {string} props.startDate - Selected start date
 * @param {Function} props.onChange - Change handler
 * @returns {React.ReactElement} Start date picker
 */
function StartDatePicker({ startDate, onChange }) {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 text-center">Start Date</h3>
      <input
        type="date"
        value={startDate || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border box-border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-black cursor-pointer"
      />
    </div>
  );
}

export default StartDatePicker;