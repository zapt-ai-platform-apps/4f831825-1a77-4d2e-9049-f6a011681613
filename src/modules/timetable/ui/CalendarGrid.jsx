import React from 'react';
import * as Sentry from '@sentry/browser';
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, format } from 'date-fns';
import CalendarHeader from './CalendarHeader';
import CalendarDay from './CalendarDay';
import { useTimetableContext } from './TimetableContext';

/**
 * Calendar grid component
 * @param {Object} props - Component props
 * @param {Date} props.currentMonth - Current month to display
 * @param {Date} props.selectedDate - Selected date
 * @param {Function} props.onDateClick - Date click handler
 * @returns {React.ReactElement} Calendar grid
 */
function CalendarGrid({ currentMonth, selectedDate, onDateClick }) {
  const { datesWithData, subjectColours } = useTimetableContext();
  
  const daysInMonth = () => {
    const parsedMonth = new Date(currentMonth);
    if (isNaN(parsedMonth)) {
      Sentry.captureException(`Invalid currentMonth: ${currentMonth}`);
      return [];
    }
    const start = startOfMonth(parsedMonth);
    const end = endOfMonth(parsedMonth);
    if (start > end) {
      console.error('startOfMonth is after endOfMonth:', start, end);
      return [];
    }
    return eachDayOfInterval({ start, end });
  };

  const startDayOfWeek = () => {
    const parsedMonth = new Date(currentMonth);
    if (isNaN(parsedMonth)) {
      console.warn('currentMonth is invalid. Defaulting start day to Sunday.');
      return 0; // Sunday
    }
    return getDay(startOfMonth(parsedMonth));
  };

  const monthDays = daysInMonth();
  const dayOffset = startDayOfWeek();

  return (
    <div className="w-full px-1 sm:px-2 md:px-5 lg:px-10 box-border">
      <CalendarHeader />
      <div className="grid grid-cols-7 auto-rows-[minmax(50px,auto)] md:auto-rows-[minmax(60px,auto)] gap-[1px] sm:gap-[2px]">
        {Array.from({ length: dayOffset }).map((_, index) => (
          <div key={`empty-${index}`} className="dark:bg-gray-800"></div>
        ))}
        {monthDays.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasData = datesWithData[dateStr];
          return (
            <CalendarDay
              key={dateStr}
              day={day}
              hasData={hasData}
              selectedDate={selectedDate}
              onDateClick={onDateClick}
              subjectColours={subjectColours}
            />
          );
        })}
      </div>
    </div>
  );
}

export default CalendarGrid;