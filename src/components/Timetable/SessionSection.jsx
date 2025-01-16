import React from 'react';

function SessionSection({ sessions, subjectColours }) {
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
      <h4 className="text-lg font-semibold mb-2">Revision Sessions</h4>
      <div className="space-y-4">
        {sessions.map((session, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border-l-4 relative"
            style={{ borderColor: subjectColours[session.subject] }}
          >
            <p className="font-semibold text-black flex items-center">
              <span
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: subjectColours[session.subject] }}
              ></span>
              Subject: {capitalizeFirstLetter(session.subject)}
            </p>
            <p className="text-black">Time of Day: {session.block}</p>
            {/* Show time range only if present */}
            {session.startTime && session.endTime && (
              <p className="text-black">
                Time: {formatTime(session.startTime)} - {formatTime(session.endTime)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SessionSection;