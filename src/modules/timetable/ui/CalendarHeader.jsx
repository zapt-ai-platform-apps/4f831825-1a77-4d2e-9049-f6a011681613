import React from 'react';

/**
 * Calendar header component showing day names
 * @returns {React.ReactElement} Calendar header
 */
function CalendarHeader() {
  return (
    <div className="grid grid-cols-7 gap-0 sm:gap-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="text-center font-semibold text-xs sm:text-sm">
          {day}
        </div>
      ))}
    </div>
  );
}

export default CalendarHeader;