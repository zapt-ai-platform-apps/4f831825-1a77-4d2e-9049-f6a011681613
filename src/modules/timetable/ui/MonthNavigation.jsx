import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * Component for month navigation
 * @param {Object} props - Component props
 * @param {Date} props.currentMonth - Current month
 * @param {Function} props.onPrevMonth - Previous month handler
 * @param {Function} props.onNextMonth - Next month handler
 * @param {Date} props.minDate - Minimum allowed date
 * @param {Date} props.maxDate - Maximum allowed date
 * @returns {React.ReactElement} Month navigation component
 */
function MonthNavigation({ currentMonth, onPrevMonth, onNextMonth, minDate, maxDate }) {
  if (!currentMonth) return null;
  
  const isPrevDisabled = () => {
    if (!minDate || !currentMonth) return false;
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    return prevMonth < minMonth;
  };

  const isNextDisabled = () => {
    if (!maxDate || !currentMonth) return false;
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    return nextMonth > maxMonth;
  };

  const formatMonthYear = () => {
    if (!currentMonth) return 'Loading...';
    try {
      return currentMonth.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting month year:', error);
      return 'Invalid Date';
    }
  };

  const getPrevNextMonthNames = () => {
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);

    const prevMonthName = prevMonth.toLocaleString('default', { month: 'long' });
    const nextMonthName = nextMonth.toLocaleString('default', { month: 'long' });

    return { prevMonthName, nextMonthName };
  };

  const disabledPrev = isPrevDisabled();
  const disabledNext = isNextDisabled();
  const monthYear = formatMonthYear();
  const { prevMonthName, nextMonthName } = getPrevNextMonthNames();

  return (
    <div className="flex items-center justify-between w-full max-w-xs px-2">
      <button
        className={`flex items-center justify-center w-9 h-9 rounded-full transition cursor-pointer ${
          disabledPrev 
            ? 'bg-gray-500 dark:bg-gray-600 cursor-not-allowed' 
            : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 active:bg-blue-700 dark:active:bg-blue-800'
        }`}
        onClick={onPrevMonth}
        disabled={disabledPrev}
        aria-label={`Previous month (${prevMonthName})`}
      >
        <FaChevronLeft className="w-4 h-4 text-white" />
      </button>
      
      <div className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
        {monthYear}
      </div>
      
      <button
        className={`flex items-center justify-center w-9 h-9 rounded-full transition cursor-pointer ${
          disabledNext 
            ? 'bg-gray-500 dark:bg-gray-600 cursor-not-allowed' 
            : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 active:bg-blue-700 dark:active:bg-blue-800'
        }`}
        onClick={onNextMonth}
        disabled={disabledNext}
        aria-label={`Next month (${nextMonthName})`}
      >
        <FaChevronRight className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}

export default MonthNavigation;