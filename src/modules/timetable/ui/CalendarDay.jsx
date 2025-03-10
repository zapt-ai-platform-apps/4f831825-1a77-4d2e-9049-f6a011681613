import React from 'react';
import ExamItems from './ExamItems';
import SessionItems from './SessionItems';

/**
 * Calendar day component
 * @param {Object} props - Component props
 * @param {Date} props.day - Day date
 * @param {Object} props.hasData - Data for this day
 * @param {Date} props.selectedDate - Selected date
 * @param {Function} props.onDateClick - Date click handler
 * @param {Object} props.subjectColours - Subject color mapping
 * @returns {React.ReactElement} Calendar day
 */
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
      className={`relative border border-gray-200 cursor-pointer bg-white hover:bg-gray-50 transition duration-200 ${
        isSelected ? 'border-2 border-primary ring-2 ring-primary/20' : ''
      } min-h-[80px] md:min-h-[100px] p-1`}
      onClick={() => onDateClick(day)}
    >
      <div className="absolute top-1 left-1 font-sans font-semibold text-xs md:text-sm text-gray-700">
        {day.getDate()}
      </div>
      {hasData && (
        <div className="mt-5 md:mt-6 px-1">
          {hasData.exams.length > 0 && <ExamItems exams={hasData.exams} />}
          <SessionItems sortedSessions={sortedSessions} subjectColours={subjectColours} />
        </div>
      )}
    </div>
  );
}

export default CalendarDay;