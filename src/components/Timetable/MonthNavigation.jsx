import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function MonthNavigation({ currentMonth, handlePrevMonth, handleNextMonth, maxDate, minDate }) {
  const isPrevDisabled = () => {
    if (!minDate) return false;
    const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    const minMonth = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    return prevMonth < minMonth;
  };

  const isNextDisabled = () => {
    if (!maxDate) return false;
    const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
    return nextMonth > maxMonth;
  };

  const formatMonthYear = () => {
    return currentMonth.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="mt-4 mb-4 w-full mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <button
          className={`flex items-center px-4 py-2 mb-2 sm:mb-0 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${
            isPrevDisabled()
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
          }`}
          onClick={handlePrevMonth}
          disabled={isPrevDisabled()}
        >
          <FaChevronLeft className="w-6 h-6 inline-block" />
          <span className="ml-1">Previous</span>
        </button>
        <div className="text-lg font-semibold mx-4 my-2 sm:my-0 text-center text-white">
          {formatMonthYear()}
        </div>
        <button
          className={`flex items-center px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${
            isNextDisabled()
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
          }`}
          onClick={handleNextMonth}
          disabled={isNextDisabled()}
        >
          <span className="mr-1">Next</span>
          <FaChevronRight className="w-6 h-6 inline-block" />
        </button>
      </div>
    </div>
  );
}

export default MonthNavigation;