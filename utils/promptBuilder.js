export function buildTimetablePrompt(examsData, userPreferences, revisionTimes, blockTimesData) {
  return `
You are an AI that helps create a study timetable.

User's exam data (array of exams with date/time):
${JSON.stringify(examsData, null, 2)}

User's preferences:
Start date: ${userPreferences.startDate}
Revision times: ${JSON.stringify(revisionTimes, null, 2)}
Block times: ${JSON.stringify(blockTimesData, null, 2)}

We want you to produce a JSON array listing every block (Morning, Afternoon, Evening) for each day, from the user's start date up to the last exam date. If a block is not used for active study, use "subject": "Rest".

Each item of the array must have exactly:
{
  "date": "YYYY-MM-DD",
  "block": "Morning or Afternoon or Evening",
  "subject": "string"
}

Do not return "startTime" or "endTime" or any other keys. Return valid JSON only.

Wrap your JSON array in an object with the single property "revision_dates".

No additional text outside of that JSON structure.
  `;
}