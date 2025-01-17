import React from 'react';
import { format } from 'date-fns';
import ExamSection from './ExamSection';
import SessionSection from './SessionSection';

function DayDetails({ date, datesWithData, subjectColours, refreshTimetableData }) {
  const dateKey = format(date, 'yyyy-MM-dd');
  const dataForDay = datesWithData[dateKey] || { sessions: [], exams: [] };

  const sortedSessions = dataForDay.sessions.slice().sort((a, b) => {
    const blockOrder = ['Morning', 'Afternoon', 'Evening'];
    return blockOrder.indexOf(a.block) - blockOrder.indexOf(b.block);
  });

  return (
    <div className="bg-white text-black p-4 rounded-lg mt-4">
      <h3 className="text-xl font-bold mb-4 text-center">
        Details for {new Date(date).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
      </h3>
      <div className="space-y-6">
        {dataForDay.exams.length > 0 && <ExamSection exams={dataForDay.exams} />}
        {sortedSessions.length > 0 && (
          <SessionSection
            sessions={sortedSessions}
            subjectColours={subjectColours}
          />
        )}
        {dataForDay.exams.length === 0 && sortedSessions.length === 0 && (
          <p className="text-center">No events for this day.</p>
        )}
      </div>
    </div>
  );
}

export default DayDetails;