/**
 * Builds a review prompt for ChatGPT
 * @param {string} userId - User ID
 * @param {Array} timetable - Array of timetable entries
 * @returns {string} Formatted prompt for AI review
 */
export function buildReviewPrompt(userId, timetable) {
  if (!timetable || timetable.length === 0) {
    return '';
  }
  
  // Group sessions by date
  const sessionsByDate = timetable.reduce((acc, session) => {
    if (!acc[session.date]) {
      acc[session.date] = [];
    }
    acc[session.date].push(session);
    return acc;
  }, {});
  
  // Format dates for the prompt
  const formattedDates = Object.keys(sessionsByDate).sort().map(date => {
    const sessions = sessionsByDate[date];
    const formattedSessions = sessions.map(session => {
      return `  - ${session.block}: ${session.subject} (ID: ${session.id})`;
    }).join('\n');
    
    return `${date}:\n${formattedSessions}`;
  }).join('\n\n');
  
  // Build the full prompt
  return `I have generated a revision timetable for a student (user ID: ${userId}). Please review it for any improvements or balancing issues. Here is the timetable:

${formattedDates}

Please suggest specific improvements to help distribute revision more effectively or to create a better learning experience.

Format your response as valid JSON like this:
{
  "feedback": "Your overall feedback and suggestions here",
  "changes": [
    {"id": "session1_id", "subject": "New Subject"},
    {"id": "session2_id", "subject": "New Subject"}
  ]
}

Only include sessions in the "changes" array if you recommend changing them. If no changes are needed, return an empty array.`;
}