import React from 'react';
import { useTimetable } from '../../contexts/TimetableContext';

function SessionSection({ sessions, subjectColours }) {
  const { preferences } = useTimetable();

  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':');
    return `${hour}:${minute}`;
  };

  return (
    <div>
      <h4 className="text-base sm:text-lg font-semibold mb-2">Revision Sessions</h4>
      <div className="space-y-3">
        {sessions.map((session, index) => {
          const startTime =
            session.startTime || preferences.blockTimes[session.block]?.startTime || '';
          const endTime =
            session.endTime || preferences.blockTimes[session.block]?.endTime || '';
          const blockTimeDisplay =
            startTime && endTime ? ` (${formatTime(startTime)} - ${formatTime(endTime)})` : '';
          return (
            <div
              key={index}
              className="p-3 rounded-lg border-l-4 relative"
              style={{ borderColor: subjectColours[session.subject] }}
            >
              <p className="font-semibold text-black flex items-center text-sm sm:text-base">
                <span
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: subjectColours[session.subject] }}
                ></span>
                {session.block}{blockTimeDisplay}
              </p>
              <p className="text-black text-xs sm:text-sm">
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