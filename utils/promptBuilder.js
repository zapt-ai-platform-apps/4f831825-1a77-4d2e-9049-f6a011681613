/**
 * buildTimetablePrompt
 * We only provide ChatGPT:
 * - The user's upcoming exams (examsData)
 * - A list of blank session slots (blankSessions) that have {date, block, subject: ""}
 *
 * ChatGPT must assign a valid subject to each session from the user's exam subjects.
 * No "Rest" is allowed.
 * It should avoid placing the same subject in consecutive blocks on the same day if possible,
 * and prioritize subjects with earlier exam dates by scheduling earlier sessions for them.
 *
 * The response must be valid JSON with the property "revision_dates" containing only the array.
 * Each item in the array must have { date, block, subject }.
 */
export function buildTimetablePrompt(examsData, blankSessions) {
  return `
We have an array of session slots, each with a date, block, and an empty subject.
We also have an array of upcoming exams.

Requirements:
1. Fill "subject" for each session using only the exam subjects.
2. Do NOT use "Rest" at all; each session must have a valid subject.
3. Distribute sessions logically among the different subjects, taking exam dates into account.
4. Prioritize subjects with earlier exam dates by scheduling earlier sessions for them.
5. Avoid scheduling the same subject in consecutive sessions on the same day if possible.

Return exactly the same "blankSessions" array, but with the "subject" field filled, as valid JSON in the format:

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

Here is the data:
"exams": ${JSON.stringify(examsData, null, 2)}
"blankSessions": ${JSON.stringify(blankSessions, null, 2)}
`;
}