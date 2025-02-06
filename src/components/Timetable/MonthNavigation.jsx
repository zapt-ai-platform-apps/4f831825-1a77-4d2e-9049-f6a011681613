import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import * as Sentry from '@sentry/react';
import { isPrevDisabled, isNextDisabled, formatMonthYear, getPrevNextMonthNames } from './MonthNavigation.utils';

function MonthNavigation({ currentMonth, handlePrevMonth, handleNextMonth, maxDate, minDate }) {
  const disabledPrev = isPrevDisabled(currentMonth, minDate);
  const disabledNext = isNextDisabled(currentMonth, maxDate);

  const monthYear = formatMonthYear(currentMonth, Sentry);
  const { prevMonthName, nextMonthName } = getPrevNextMonthNames(currentMonth);

  return (
    <div className="flex items-center space-x-2">
      <button
        className={`flex items-center px-2 py-1 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${
          disabledPrev ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
        } text-xs sm:text-sm`}
        onClick={handlePrevMonth}
        disabled={disabledPrev}
      >
        <FaChevronLeft className="w-4 h-4 inline-block" />
        <span className="ml-1 hidden sm:inline">{prevMonthName}</span>
      </button>
      <div className="text-xs sm:text-sm font-semibold text-white">
        {monthYear}
      </div>
      <button
        className={`flex items-center px-2 py-1 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${
          disabledNext ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
        } text-xs sm:text-sm`}
        onClick={handleNextMonth}
        disabled={disabledNext}
      >
        <span className="mr-1 hidden sm:inline">{nextMonthName}</span>
        <FaChevronRight className="w-4 h-4 inline-block" />
      </button>
    </div>
  );
}

export default MonthNavigation;