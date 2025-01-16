/**
 * Builds the prompt to send to ChatGPT for reviewing the timetable.
 *
 * @param {Array} localTimetable - The locally generated timetable.
 * @returns {string} - The constructed prompt.
 */
export function buildReviewPrompt(localTimetable) {
  const reviewPayload = localTimetable.map((item) => ({
    date: item.date,
    block: item.block,
    subject: item.subject,
  }));

  const prompt = `
We have generated a revision timetable locally with the following sessions:
${JSON.stringify(reviewPayload, null, 2)}

Please review this schedule to see if it meets typical scheduling constraints:
1. No subject scheduled on or after its exam date.
2. Avoiding more than two consecutive sessions of the same subject where possible.
3. Balanced distribution among all subjects.
4. No intense consecutive scheduling of the same subject on the same day if possible.
5. Otherwise, keep the schedule as is.

If changes are needed, please correct them. Return valid JSON in the format:
{
  "revision_dates": [
    {
      "date": "YYYY-MM-DD",
      "block": "Morning/Afternoon/Evening",
      "subject": "SubjectName"
    },
    ...
  ]
}
If no changes are needed, simply return the same array in the JSON structure above.
`;
  return prompt;
}