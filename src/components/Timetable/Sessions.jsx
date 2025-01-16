import React from 'react';

function Sessions({ sortedSessions, subjectColours }) {
  return (
    <div className="space-y-2">
      {sortedSessions.map((session, idx) => (
        <div
          key={idx}
          className="p-1 rounded text-xs sm:text-sm cursor-pointer"
          style={{ backgroundColor: subjectColours[session.subject] || '#ccc' }}
        >
          {/* Show block name on desktop sizes only */}
          <span className="hidden sm:inline font-semibold">
            {session.block}:
          </span>
          {/* Always show the subject name */}
          <span> {session.subject}</span>
        </div>
      ))}
    </div>
  );
}

export default Sessions;