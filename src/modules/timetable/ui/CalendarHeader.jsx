import React from 'react';

/**
 * Calendar header component showing day names
 * @returns {React.ReactElement} Calendar header
 */
function CalendarHeader() {
  return (
    <div className="grid grid-cols-7 gap-[2px] sm:gap-1 mb-1">
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
        <div key={day + index} className="text-center font-semibold text-xs sm:text-sm py-1">
          <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}</span>
          <span className="sm:hidden">{day}</span>
        </div>
      ))}
    </div>
  );
}

export default CalendarHeader;