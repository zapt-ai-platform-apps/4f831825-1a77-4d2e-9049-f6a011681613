import { createSignal, createMemo } from 'solid-js';
import DayDetailsContent from './DayDetailsContent';
import { deleteSession } from '../../api/deleteSession';

function DayDetails(props) {
  const [editSession, setEditSession] = createSignal(null);
  const [loading, setLoading] = createSignal(false);

  const dateKey = () => props.date.toISOString().split('T')[0];
  const dataForDay = () => props.datesWithData()[dateKey()] || { sessions: [], exams: [] };

  const sortedSessions = createMemo(() => {
    const sessions = dataForDay().sessions || [];
    const desiredOrder = ['Morning', 'Afternoon', 'Evening'];
    return sessions.slice().sort((a, b) => {
      return desiredOrder.indexOf(a.block) - desiredOrder.indexOf(b.block);
    });
  });

  const refreshTimetableData = props.refreshTimetableData;

  const handleSessionSaved = () => {
    setEditSession(null);
    refreshTimetableData();
  };

  const handleEditSession = (session) => {
    setEditSession(session);
  };

  const handleDeleteSession = async (session) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    setLoading(true);
    try {
      await deleteSession(props.date.toISOString().split('T')[0], session.block);
      refreshTimetableData();
    } catch (error) {
      // Error handling is done in deleteSession
    } finally {
      setLoading(false);
    }
  };

  return (
    <DayDetailsContent
      date={props.date}
      dataForDay={dataForDay}
      sortedSessions={sortedSessions}
      subjectColours={props.subjectColours}
      editSession={editSession}
      setEditSession={setEditSession}
      loading={loading}
      handleSessionSaved={handleSessionSaved}
      handleEditSession={handleEditSession}
      handleDeleteSession={handleDeleteSession}
    />
  );
}

export default DayDetails;