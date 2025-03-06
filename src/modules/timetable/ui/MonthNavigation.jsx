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
    <div className="flex items-center space-x-2">
      <button
        className={`flex items-center px-2 py-1 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
          disabledPrev ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        } text-xs sm:text-sm`}
        onClick={onPrevMonth}
        disabled={disabledPrev}
      >
        <FaChevronLeft className="w-4 h-4 inline-block" />
        <span className="ml-1 hidden sm:inline">{prevMonthName}</span>
      </button>
      <div className="text-xs sm:text-sm font-semibold text-white">
        {monthYear}
      </div>
      <button
        className={`flex items-center px-2 py-1 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
          disabledNext ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        } text-xs sm:text-sm`}
        onClick={onNextMonth}
        disabled={disabledNext}
      >
        <span className="mr-1 hidden sm:inline">{nextMonthName}</span>
        <FaChevronRight className="w-4 h-4 inline-block" />
      </button>
    </div>
  );
}

export default MonthNavigation;