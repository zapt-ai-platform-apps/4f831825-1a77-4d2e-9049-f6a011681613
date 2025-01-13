import React from 'react';
import { isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns';
import DayCell from './DayCell';

function CalendarGrid({ currentMonth, datesWithData, selectedDate, onDateClick, subjectColours }) {
  const daysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const startDayOfWeek = () => {
    return getDay(startOfMonth(currentMonth));
  };

  return (
    <div className="w-screen px-2 md:px-10 lg:px-20 xl:px-40 box-border">
      <div className="grid grid-cols-7 gap-0 sm:gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-xs sm:text-sm">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-[minmax(60px,auto)] sm:auto-rows-[minmax(150px,auto)] gap-0 sm:gap-2">
        {Array.from({ length: ((startDayOfWeek() + 6) % 7) }).map((_, index) => (
          <div key={`empty-${index}`}></div>
        ))}
        {daysInMonth().map((day) => (
          <DayCell
            key={day.toISOString()}
            day={day}
            datesWithData={datesWithData}
            isSelected={() => selectedDate && isSameDay(day, selectedDate)}
            onDateClick={onDateClick}
            subjectColours={subjectColours}
          />
        ))}
      </div>
    </div>
  );
}

export default CalendarGrid;