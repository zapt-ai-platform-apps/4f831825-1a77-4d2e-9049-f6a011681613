import React from 'react';
import { useTimetable } from '../../contexts/TimetableContext';

function Sessions({ sortedSessions, subjectColours }) {
  const { preferences } = useTimetable();

  const getTimeInfo = (session) => {
    const startTime =
      session.startTime || preferences.blockTimes[session.block]?.startTime || '';
    const endTime =
      session.endTime || preferences.blockTimes[session.block]?.endTime || '';
    return startTime && endTime ? ` (${startTime} - ${endTime})` : '';
  };

  return (
    <div className="space-y-2">
      {sortedSessions.map((session, idx) => {
        const timeDisplay = getTimeInfo(session);
        return (
          <div
            key={idx}
            className="p-1 rounded text-xs sm:text-sm cursor-pointer"
            style={{ backgroundColor: subjectColours[session.subject] || '#ccc' }}
            title={`${session.block} Block${timeDisplay}`}
          >
            <p className="font-semibold">
              {session.block}{timeDisplay}:
            </p>
            <p className="truncate">{session.subject}</p>
          </div>
        );
      })}
    </div>
  );
}

export default Sessions;