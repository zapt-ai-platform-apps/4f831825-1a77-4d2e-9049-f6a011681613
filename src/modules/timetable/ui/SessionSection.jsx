import React from 'react';
import { useTimetableContext } from './TimetableContext';

/**
 * Component to display session section in day details
 * @param {Object} props - Component props
 * @param {Array} props.sessions - Sessions for this day
 * @param {Object} props.subjectColours - Subject color mapping
 * @returns {React.ReactElement} Session section component
 */
function SessionSection({ sessions, subjectColours }) {
  const { preferences } = useTimetableContext();

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hour, 10), parseInt(minute, 10));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div>
      <h4 className="text-base font-semibold mb-1.5 dark:text-white">Revision Sessions</h4>
      <div className="space-y-2">
        {sessions.map((session, index) => {
          const startTime =
            session.startTime || preferences?.blockTimes?.[session.block]?.startTime || '';
          const endTime =
            session.endTime || preferences?.blockTimes?.[session.block]?.endTime || '';
          const blockTimeDisplay =
            startTime && endTime ? ` (${formatTime(startTime)} - ${formatTime(endTime)})` : '';
          return (
            <div
              key={index}
              className="p-2 rounded-lg border-l-4 relative dark:bg-gray-700/30"
              style={{ borderColor: subjectColours[session.subject] }}
            >
              <p className="font-semibold text-black dark:text-white flex items-center text-xs sm:text-sm">
                <span
                  className="w-2.5 h-2.5 rounded-full mr-1.5"
                  style={{ backgroundColor: subjectColours[session.subject] }}
                ></span>
                {session.block}{blockTimeDisplay}
              </p>
              <p className="text-black dark:text-white text-xs sm:text-sm truncate">
                {capitalizeFirstLetter(session.subject)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SessionSection;