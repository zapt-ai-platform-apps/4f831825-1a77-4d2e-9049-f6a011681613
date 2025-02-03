import React from 'react';
import { getSessionTime, getSessionsToDisplay } from './sessionHelpers';

function SessionsList({ sortedSessions, subjectColours }) {
  return (
    <>
      <div className="mt-3 flex flex-col gap-0.5 px-1 sm:hidden">
        {getSessionsToDisplay(sortedSessions).map((session, index) =>
          session.subject ? (
            <div
              key={index}
              className="flex items-center justify-center h-4 text-[8px] font-bold text-white rounded cursor-pointer"
              style={{ backgroundColor: subjectColours[session.subject] }}
            >
              {session.subject.substring(0, 3).toUpperCase()}
            </div>
          ) : (
            <div key={index} className="flex-1 h-4"></div>
          )
        )}
      </div>
      <div className="hidden sm:block mt-4 px-1">
        {getSessionsToDisplay(sortedSessions).map((session, index) =>
          session.subject ? (
            <div
              key={index}
              className="mb-1 p-1 rounded text-white text-xs cursor-pointer"
              style={{ backgroundColor: subjectColours[session.subject] }}
            >
              <div className="font-bold truncate">{session.subject}</div>
              <div className="text-[10px] opacity-75">
                {session.block} {getSessionTime(session)}
              </div>
            </div>
          ) : (
            <div key={index} className="mb-1 p-1 rounded text-transparent text-xs cursor-default">
              <div className="font-bold">&nbsp;</div>
              <div className="text-[10px]">&nbsp;</div>
            </div>
          )
        )}
      </div>
    </>
  );
}

export default SessionsList;