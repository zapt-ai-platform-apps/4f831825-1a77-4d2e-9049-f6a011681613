import React from 'react';
import { useTimetable } from '../../contexts/TimetableContext';

function Sessions({ sortedSessions, subjectColours }) {
  const { preferences } = useTimetable();
  return (
    <div className="space-y-2">
      {sortedSessions.map((session, idx) => {
        const startTime = session.startTime || preferences.blockTimes[session.block]?.startTime || '';
        const endTime = session.endTime || preferences.blockTimes[session.block]?.endTime || '';
        const timeInfo = startTime && endTime ? ` (${startTime} - ${endTime})` : '';
        return (
          <div
            key={idx}
            className="p-1 rounded text-xs sm:text-sm cursor-pointer"
            style={{ backgroundColor: subjectColours[session.subject] || '#ccc' }}
            title={`${session.block} Block${timeInfo}`}
          >
            <span className="hidden sm:inline font-semibold">
              {session.block}:
            </span>
            <span> {session.subject}{timeInfo}</span>
          </div>
        );
      })}
    </div>
  );
}

export default Sessions;