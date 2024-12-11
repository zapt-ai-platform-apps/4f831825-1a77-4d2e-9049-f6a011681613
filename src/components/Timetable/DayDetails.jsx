import { createMemo } from 'solid-js';
import DayDetailsContent from './DayDetailsContent';

function DayDetails(props) {
  const dateKey = () => props.date.toISOString().split('T')[0];
  const dataForDay = () => props.datesWithData()[dateKey()] || { sessions: [], exams: [] };

  const sortedSessions = createMemo(() => {
    const sessions = dataForDay().sessions || [];
    const desiredOrder = ['Morning', 'Afternoon', 'Evening'];
    return sessions.slice().sort((a, b) => {
      return desiredOrder.indexOf(a.block) - desiredOrder.indexOf(b.block);
    });
  });

  return (
    <DayDetailsContent
      date={props.date}
      dataForDay={dataForDay}
      sortedSessions={sortedSessions}
      subjectColours={props.subjectColours}
    />
  );
}

export default DayDetails;