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
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <button
          className={`flex items-center px-4 py-2 mb-2 sm:mb-0 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${
            disabledPrev
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
          }`}
          onClick={handlePrevMonth}
          disabled={disabledPrev}
        >
          <FaChevronLeft className="w-6 h-6 inline-block" />
          <span className="ml-1">{prevMonthName}</span>
        </button>
        <div className="text-lg font-semibold mx-4 my-2 sm:my-0 text-center text-white">
          {monthYear}
        </div>
        <button
          className={`flex items-center px-4 py-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 ${
            disabledNext
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
          }`}
          onClick={handleNextMonth}
          disabled={disabledNext}
        >
          <span className="mr-1">{nextMonthName}</span>
          <FaChevronRight className="w-6 h-6 inline-block" />
        </button>
      </div>
    </div>
  );
}

export default MonthNavigation;