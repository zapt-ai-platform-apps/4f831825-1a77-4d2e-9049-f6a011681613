/**
 * buildTimetablePrompt
 * We only provide ChatGPT:
 * - The user's upcoming exams (examsData)
 * - A list of blank session slots (blankSessions) that have {date, block, subject: ""}
 *
 * ChatGPT must assign a valid subject to each session from the user's exam subjects.
 * No "Rest" is allowed.
 * It should avoid placing the same subject in consecutive blocks on the same day if possible,
 * limit the same subject to no more than two consecutive sessions across days if it can be avoided,
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
1. Fill "subject" for each session using only the exam subjects (strictly no "Rest"). 
2. Spread out subjects so that large consecutive runs of the same subject are avoided, both within a day and across days.
3. Do not schedule the same subject for more than two sessions in a row if it can be avoided.
4. Distribute sessions logically among the different subjects, taking exam dates into account so that subjects with earlier exam dates get sufficient sessions earlier.
5. Prioritize subjects with earlier exam dates over those with later ones, but still spread them out to avoid long runs of the same subject.
6. Avoid scheduling the same subject in consecutive sessions on the same day if possible.
7. Return a balanced, logical schedule that prevents loads of the same session together.
8. The final schedule must fill all provided blank session slots with some subject from the user's list.
9. Do not schedule a subject on or after its exam date. If a session’s date is the same as or after the subject’s exam date, that subject cannot be assigned.

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

Here is your data:
"exams": ${JSON.stringify(examsData, null, 2)}
"blankSessions": ${JSON.stringify(blankSessions, null, 2)}
`;
}