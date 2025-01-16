import React from 'react';
import Exams from './Exams';
import Sessions from './Sessions';

function CalendarDay({ day, hasData, selectedDate, onDateClick, subjectColours }) {
  const isSelected =
    selectedDate && new Date(selectedDate).toDateString() === day.toDateString();

  // Define block order for sorting sessions
  const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };

  // Sort sessions by block
  let sortedSessions = [];
  if (hasData) {
    sortedSessions = hasData.sessions
      .slice()
      .sort((a, b) => blockOrder[a.block] - blockOrder[b.block]);
  }

  return (
    <div
      className={`relative border border-white cursor-pointer hover:bg-gray-700 hover:bg-opacity-25 transition duration-200 ease-in-out ${
        isSelected ? 'border-2 border-yellow-500' : ''
      } min-h-[60px] sm:min-h-[150px]`}
      onClick={() => onDateClick(day)}
    >
      <div className="absolute top-1 left-1 font-bold text-xs sm:text-base text-white">
        {day.getDate()}
      </div>
      {hasData && (
        <>
          {hasData.exams.length > 0 && (
            <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 sm:hidden"></div>
          )}
          <div className="mt-5 sm:mt-10">
            {hasData.exams.length > 0 && (
              <Exams exams={hasData.exams} />
            )}
            <Sessions sortedSessions={sortedSessions} subjectColours={subjectColours} />
          </div>
        </>
      )}
    </div>
  );
}

export default CalendarDay;