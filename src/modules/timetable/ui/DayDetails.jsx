import React from 'react';
import { format } from 'date-fns';
import ExamSection from './ExamSection';
import SessionSection from './SessionSection';

/**
 * Component to display details for a selected day
 * @param {Object} props - Component props
 * @param {Date} props.date - Selected date
 * @param {Object} props.datesWithData - Dates with data
 * @param {Object} props.subjectColours - Subject color mapping
 * @returns {React.ReactElement} Day details component
 */
function DayDetails({ date, datesWithData, subjectColours }) {
  const dateKey = format(date, 'yyyy-MM-dd');
  const dataForDay = datesWithData[dateKey] || { sessions: [], exams: [] };

  const sortedSessions = dataForDay.sessions.slice().sort((a, b) => {
    const blockOrder = ['Morning', 'Afternoon', 'Evening'];
    return blockOrder.indexOf(a.block) - blockOrder.indexOf(b.block);
  });

  return (
    <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-2 sm:p-3 rounded-lg mt-2 sm:mt-3 mx-1 sm:mx-0 shadow-lg">
      <h3 className="text-base sm:text-lg font-bold mb-2 sm:mb-3 text-center">
        {new Date(date).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
      </h3>
      <div className="space-y-2 sm:space-y-3">
        {dataForDay.exams.length > 0 && <ExamSection exams={dataForDay.exams} />}
        {sortedSessions.length > 0 && (
          <SessionSection
            sessions={sortedSessions}
            subjectColours={subjectColours}
          />
        )}
        {dataForDay.exams.length === 0 && sortedSessions.length === 0 && (
          <p className="text-center text-sm sm:text-base dark:text-gray-300">No events for this day</p>
        )}
      </div>
    </div>
  );
}

export default DayDetails;