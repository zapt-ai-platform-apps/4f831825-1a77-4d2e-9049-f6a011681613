import React from 'react';
import Exams from './Exams';
import Sessions from './Sessions';

function CalendarDay({ day, hasData, selectedDate, onDateClick, subjectColours }) {
  const isSelected =
    selectedDate && new Date(selectedDate).toDateString() === day.toDateString();

  const blockOrder = { Morning: 0, Afternoon: 1, Evening: 2 };

  let sortedSessions = [];
  if (hasData) {
    sortedSessions = hasData.sessions
      .slice()
      .sort((a, b) => blockOrder[a.block] - blockOrder[b.block]);
  }

  return (
    <div
      className={`relative border border-white/20 cursor-pointer bg-background hover:bg-white/5 transition duration-200 ${
        isSelected ? 'border-2 border-primary ring-2 ring-primary/20' : ''
      } min-h-[70px] sm:min-h-[100px]`}
      onClick={() => onDateClick(day)}
    >
      <div className="absolute top-1 left-1 font-sans font-semibold text-xs sm:text-sm text-white/80">
        {day.getDate()}
      </div>
      {hasData && (
        <div className="mt-4 sm:mt-6 px-1 pb-2">
          {hasData.exams.length > 0 && <Exams exams={hasData.exams} />}
          <Sessions sortedSessions={sortedSessions} subjectColours={subjectColours} />
        </div>
      )}
    </div>
  );
}

export default CalendarDay;