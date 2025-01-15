export function buildTimetablePrompt(examsData, userPreferences, revisionTimes, blockTimesData) {
  return `
You are an AI that helps create a study timetable.
User's exam data (array of exams with date/time): ${JSON.stringify(examsData, null, 2)}
User's preferences:
Start date: ${userPreferences.startDate}
Revision times: ${JSON.stringify(revisionTimes, null, 2)}
Block times: ${JSON.stringify(blockTimesData, null, 2)}
We want you to produce a JSON array that describes daily study sessions leading up to each exam.
Each item of the array should look like:
{
  "date": "YYYY-MM-DD",
  "block": "Morning or Afternoon or Evening",
  "subject": "string",
  "startTime": "HH:MM",
  "endTime": "HH:MM"
}
No extra keys, no additional text. Return valid JSON only.
Make sure that the schedule does not conflict with exam times, 
and includes final revision sessions just before each exam. 
Balance the sessions among the subjects leading up to exam days.
  `;
}