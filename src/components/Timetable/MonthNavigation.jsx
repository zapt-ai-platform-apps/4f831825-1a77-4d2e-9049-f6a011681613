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
    <div className="mt-4 mb-4 w-full mx-auto">
      <div className="flex items-center justify-center space-x-2 sm:space-x-4">
        <button
          className={`flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${
            disabledPrev
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
          }`}
          onClick={handlePrevMonth}
          disabled={disabledPrev}
        >
          <FaChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 inline-block" />
          <span className="ml-1 text-sm sm:text-base">{prevMonthName}</span>
        </button>
        <div className="text-sm sm:text-lg font-semibold text-white">
          {monthYear}
        </div>
        <button
          className={`flex items-center px-3 py-1 sm:px-4 sm:py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${
            disabledNext
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
          }`}
          onClick={handleNextMonth}
          disabled={disabledNext}
        >
          <span className="mr-1 text-sm sm:text-base">{nextMonthName}</span>
          <FaChevronRight className="w-4 h-4 sm:w-6 sm:h-6 inline-block" />
        </button>
      </div>
    </div>
  );
}

export default MonthNavigation;