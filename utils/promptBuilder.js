/**
 * buildTimetablePrompt
 * We only provide ChatGPT:
 * - The user's upcoming exams (examsData)
 * - A list of blank session slots (blankSessions) that have {date, block, subject: ""}
 * 
 * ChatGPT should fill only the "subject" field for each session.
 * If no study session is needed, set subject = "Rest".
 * Must return valid JSON with the property "revision_dates" containing the array.
 */
export function buildTimetablePrompt(examsData, blankSessions) {
  return `
We have an array of session slots, each with a date, a block, and an empty subject.
We also have an array of upcoming exams.
Please fill in the "subject" for each session. If not needed, set subject = "Rest".
Return exactly the same array, as valid JSON, in the property "revision_dates".

No other keys should be added. Do not change the date or block fields.

Here is the data:
"exams": ${JSON.stringify(examsData, null, 2)}
"blankSessions": ${JSON.stringify(blankSessions, null, 2)}

Your response should be in this format only:

{
  "revision_dates": [
    {
      "date": "YYYY-MM-DD",
      "block": "Morning/Afternoon/Evening",
      "subject": "some value"
    },
    ...
  ]
}
  `;
}