import React from 'react';

function SessionsList({ sortedSessions, subjectColours }) {
  const getSubjectCode = (subject) => {
    return subject ? subject.substring(0, 4).toUpperCase() : '';
  };

  const getSessionTime = (session) => {
    if (!session.startTime || !session.endTime) return '';
    return `${session.startTime.substring(0, 5)} - ${session.endTime.substring(0, 5)}`;
  };

  const desiredOrder = ['Morning', 'Afternoon', 'Evening'];

  const sessionsByBlock = () => {
    const map = {};
    sortedSessions.forEach((session) => {
      map[session.block] = session;
    });
    return map;
  };

  const sessionsToDisplay = () => {
    const map = sessionsByBlock();
    return desiredOrder.map((block) => map[block] || { block });
  };

  return (
    <>
      {/* Mobile view */}
      <div className="mt-5 flex flex-col gap-1 px-1 sm:hidden">
        {sessionsToDisplay().map((session, index) => (
          session.subject ? (
            <div
              key={index}
              className="flex items-center justify-center h-4 text-[8px] font-bold text-white rounded cursor-pointer"
              style={{ backgroundColor: subjectColours[session.subject] }}
            >
              {getSubjectCode(session.subject)}
            </div>
          ) : (
            <div key={index} className="flex-1 h-4"></div>
          )
        ))}
      </div>
      {/* Desktop view */}
      <div className="hidden sm:block mt-5 px-1">
        {sessionsToDisplay().map((session, index) => (
          session.subject ? (
            <div
              key={index}
              className="mb-1 p-1 rounded text-white text-xs cursor-pointer"
              style={{ backgroundColor: subjectColours[session.subject] }}
            >
              <div className="font-bold">{session.subject}</div>
              {/* Removed "Time of Day:" prefix */}
              <div className="text-[10px]">
                {session.block} {getSessionTime(session) && `(${getSessionTime(session)})`}
              </div>
            </div>
          ) : (
            <div key={index} className="mb-1 p-1 rounded text-transparent text-xs cursor-default">
              <div className="font-bold">&nbsp;</div>
              <div className="text-[10px]">&nbsp;</div>
            </div>
          )
        ))}
      </div>
    </>
  );
}

export default SessionsList;