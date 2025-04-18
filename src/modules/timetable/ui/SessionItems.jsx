import React from 'react';
import { useTimetableContext } from './TimetableContext';

/**
 * Component to display session items in a calendar day
 * @param {Object} props - Component props
 * @param {Array} props.sortedSessions - Sorted sessions for this day
 * @param {Object} props.subjectColours - Subject color mapping
 * @returns {React.ReactElement} Session items component
 */
function SessionItems({ sortedSessions, subjectColours }) {
  const { preferences } = useTimetableContext();

  const getTimeInfo = (session) => {
    const startTime =
      session.startTime || preferences?.blockTimes?.[session.block]?.startTime || '';
    const endTime =
      session.endTime || preferences?.blockTimes?.[session.block]?.endTime || '';
    return startTime && endTime ? ` (${startTime.slice(0, 5)} - ${endTime.slice(0, 5)})` : '';
  };

  return (
    <div className="space-y-0.5 overflow-hidden max-w-full">
      {sortedSessions.map((session, idx) => {
        const timeDisplay = getTimeInfo(session);
        return (
          <div
            key={idx}
            className={`py-0.5 px-1 rounded text-[8px] xs:text-[9px] sm:text-xs cursor-pointer leading-tight overflow-hidden ${
              session.isComplete ? 'opacity-60' : ''
            }`}
            style={{ 
              backgroundColor: subjectColours[session.subject] || '#ccc',
              textDecoration: session.isComplete ? 'line-through' : 'none' 
            }}
            title={`${session.block} Block${timeDisplay} ${session.isComplete ? '(Completed)' : ''}`}
          >
            <p className="font-semibold truncate w-full">
              <span className="inline xs:hidden">{session.block.charAt(0)}</span>
              <span className="hidden xs:inline">{session.block}</span>
              <span className="hidden sm:inline">{timeDisplay}</span>
            </p>
            <p className="truncate w-full">{session.subject}</p>
          </div>
        );
      })}
    </div>
  );
}

export default SessionItems;