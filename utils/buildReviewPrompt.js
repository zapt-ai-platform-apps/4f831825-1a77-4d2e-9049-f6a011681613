/**
 * Builds the prompt to send to ChatGPT for reviewing the timetable.
 *
 * We now only want ChatGPT to return the sessions that have changed,
 * referencing each session by its unique ID. If no changes are needed,
 * return "updated_sessions": [].
 *
 * @param {Array} localTimetable - The locally generated timetable with IDs.
 * @returns {string} - The constructed prompt.
 */
export function buildReviewPrompt(localTimetable) {
  /*
    We'll send ChatGPT each session's ID, date, block, and subject.
    We want ChatGPT to return only the sessions that need to change,
    in the format:

    {
      "updated_sessions": [
        {
          "id": "...",
          "subject": "..."
        },
        ...
      ]
    }

    If no changes are needed, return:
    {
      "updated_sessions": []
    }
  */

  console.log("initial Timetable: ", localTimetable)

  const payload = localTimetable.map((item) => ({
    id: item.id,
    date: item.date,
    block: item.block,
    subject: item.subject,
  }));

  // Added explicit instructions to ensure ChatGPT outputs valid JSON only.
  // No triple backticks, no disclaimers, no extra text.
  const prompt = `
We have generated a revision timetable with sessions that each include an "id", "date", "block", and "subject".

Please review this schedule to see if it meets typical scheduling constraints:
1. No subject scheduled on or after its exam date.
2. Avoid more than two consecutive sessions of the same subject if possible.
3. Distribute sessions evenly among subjects, prioritizing those with earlier exams.
4. Avoid consecutive scheduling of the same subject in the same day if possible.
5. If the schedule is acceptable, don't change anything.

IMPORTANT:
• Output ONLY the JSON object with the "updated_sessions" array.
• Do NOT include extra text, explanations, disclaimers, or code blocks.
• Do NOT include triple backticks or any formatting other than valid JSON.

Return exactly in this format:
{
  "updated_sessions": [
    {
      "id": "<ID of the session that needs a change>",
      "subject": "<New subject>"
    },
    ...
  ]
}
If no changes are required, return:
{
  "updated_sessions": []
}

Here is the current timetable data (array of session objects):
${JSON.stringify(payload, null, 2)}
  `;
  return prompt;
}
