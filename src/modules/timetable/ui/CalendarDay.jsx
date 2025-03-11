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
      className={`relative border border-gray-200 dark:border-gray-700 cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 ${
        isSelected ? 'border-2 border-primary ring-2 ring-primary/20 dark:ring-primary/40' : ''
      } min-h-[50px] md:min-h-[60px] p-0.5`}
      onClick={() => onDateClick(day)}
    >
      <div className="absolute top-0.5 left-0.5 font-sans font-semibold text-xs text-gray-700 dark:text-gray-300">
        {day.getDate()}
      </div>
      {hasData && (
        <div className="mt-3 md:mt-4 px-0.5">
          {hasData.exams.length > 0 && <ExamItems exams={hasData.exams} />}
          <SessionItems sortedSessions={sortedSessions} subjectColours={subjectColours} />
        </div>
      )}
    </div>
  );
}

export default CalendarDay;