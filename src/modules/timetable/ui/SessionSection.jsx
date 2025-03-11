import React, { useState } from 'react';
import { useTimetableContext } from './TimetableContext';
import { makeAuthenticatedRequest, handleApiResponse } from '@/modules/core/api';
import * as Sentry from '@sentry/browser';

/**
 * Component to display session section in day details
 * @param {Object} props - Component props
 * @param {Array} props.sessions - Sessions for this day
 * @param {Object} props.subjectColours - Subject color mapping
 * @returns {React.ReactElement} Session section component
 */
function SessionSection({ sessions, subjectColours }) {
  const { preferences, refreshTimetable } = useTimetableContext();
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionToSwap, setSessionToSwap] = useState(null);
  const [loading, setLoading] = useState(false);

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

  const handleSessionClick = (session) => {
    if (sessionToSwap) {
      handleSwapSession(sessionToSwap, session);
      setSessionToSwap(null);
    } else {
      setSelectedSession(session === selectedSession ? null : session);
    }
  };

  const handleDelete = async (session) => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/deleteTimetableEntry', {
        method: 'DELETE',
        body: JSON.stringify({
          date: session.date,
          block: session.block
        })
      });
      
      await handleApiResponse(response, 'Deleting session');
      setSelectedSession(null);
      refreshTimetable();
    } catch (error) {
      console.error('Error deleting session:', error);
      Sentry.captureException(error);
      alert('Failed to delete session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (session) => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/updateTimetableEntry', {
        method: 'PUT',
        body: JSON.stringify({
          date: session.date,
          block: session.block,
          isComplete: !session.isComplete
        })
      });
      
      await handleApiResponse(response, 'Updating session');
      setSelectedSession(null);
      refreshTimetable();
    } catch (error) {
      console.error('Error updating session:', error);
      Sentry.captureException(error);
      alert('Failed to update session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startSwapSession = (session) => {
    setSessionToSwap(session);
    setSelectedSession(null);
  };

  const handleSwapSession = async (session1, session2) => {
    try {
      setLoading(true);
      const response = await makeAuthenticatedRequest('/api/swapTimetableEntries', {
        method: 'POST',
        body: JSON.stringify({
          entry1: {
            date: session1.date,
            block: session1.block,
            subject: session1.subject
          },
          entry2: {
            date: session2.date,
            block: session2.block,
            subject: session2.subject
          }
        })
      });
      
      await handleApiResponse(response, 'Swapping sessions');
      refreshTimetable();
    } catch (error) {
      console.error('Error swapping sessions:', error);
      Sentry.captureException(error);
      alert('Failed to swap sessions. Please try again.');
    } finally {
      setLoading(false);
      setSessionToSwap(null);
    }
  };

  const cancelSwap = () => {
    setSessionToSwap(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-base font-semibold dark:text-white">Revision Sessions</h4>
        {sessionToSwap && (
          <button 
            onClick={cancelSwap}
            className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 cursor-pointer"
          >
            Cancel Swap
          </button>
        )}
      </div>
      
      {sessionToSwap && (
        <div className="mb-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-sm">
          <p>Select another session to swap with <strong>{sessionToSwap.subject}</strong> ({sessionToSwap.block})</p>
        </div>
      )}
      
      <div className="space-y-2">
        {sessions.map((session, index) => {
          const startTime =
            session.startTime || preferences?.blockTimes?.[session.block]?.startTime || '';
          const endTime =
            session.endTime || preferences?.blockTimes?.[session.block]?.endTime || '';
          const blockTimeDisplay =
            startTime && endTime ? ` (${formatTime(startTime)} - ${formatTime(endTime)})` : '';
          
          const isSelected = selectedSession && 
                            selectedSession.date === session.date && 
                            selectedSession.block === session.block;
                            
          return (
            <div
              key={index}
              className={`p-2 rounded-lg border-l-4 relative dark:bg-gray-700/30 transition-all ${
                isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
              } ${sessionToSwap ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''} ${
                session.isComplete ? 'opacity-70' : ''
              }`}
              style={{ borderColor: subjectColours[session.subject] }}
              onClick={() => sessionToSwap ? handleSessionClick(session) : null}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-black dark:text-white flex items-center text-xs sm:text-sm">
                    <span
                      className="w-2.5 h-2.5 rounded-full mr-1.5"
                      style={{ backgroundColor: subjectColours[session.subject] }}
                    ></span>
                    {session.block}{blockTimeDisplay}
                  </p>
                  <p className={`text-black dark:text-white text-xs sm:text-sm truncate ${
                    session.isComplete ? 'line-through' : ''
                  }`}>
                    {capitalizeFirstLetter(session.subject)}
                  </p>
                </div>
                {!sessionToSwap && (
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                    onClick={() => handleSessionClick(session)}
                    aria-label="Session options"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                )}
              </div>
              
              {isSelected && !sessionToSwap && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => handleToggleComplete(session)}
                    disabled={loading}
                    className={`cursor-pointer px-2 py-1 rounded ${
                      session.isComplete 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                    }`}
                  >
                    {session.isComplete ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                  <button
                    onClick={() => startSwapSession(session)}
                    disabled={loading}
                    className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 px-2 py-1 rounded cursor-pointer"
                  >
                    Swap Session
                  </button>
                  <button
                    onClick={() => handleDelete(session)}
                    disabled={loading}
                    className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 px-2 py-1 rounded cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SessionSection;