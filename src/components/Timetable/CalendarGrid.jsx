import React from 'react';
import * as Sentry from '@sentry/react';
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, format } from 'date-fns';
import CalendarHeader from './CalendarHeader';
import CalendarDay from './CalendarDay';

function CalendarGrid({ currentMonth, datesWithData, selectedDate, onDateClick, subjectColours }) {
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
    <div className="w-screen px-1 md:px-5 lg:px-10 xl:px-20 box-border">
      <CalendarHeader />
      <div className="grid grid-cols-7 auto-rows-[minmax(60px,auto)] sm:auto-rows-[minmax(100px,auto)] gap-0 sm:gap-1">
        {Array.from({ length: dayOffset }).map((_, index) => (
          <div key={`empty-${index}`}></div>
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