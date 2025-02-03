export function getSessionTime(session) {
  if (!session.startTime || !session.endTime) return '';
  const startDate = new Date(`1970-01-01T${session.startTime}:00`);
  const endDate = new Date(`1970-01-01T${session.endTime}:00`);
  const startFormatted = startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const endFormatted = endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return `${startFormatted} - ${endFormatted}`;
}

export function getSessionsToDisplay(sortedSessions) {
  const desiredOrder = ['Morning', 'Afternoon', 'Evening'];
  const map = {};
  sortedSessions.forEach((session) => {
    map[session.block] = session;
  });
  return desiredOrder.map((block) => map[block] || { block });
}