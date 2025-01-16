import * as Sentry from "@sentry/node";
import client from "./openaiClient.js";
import { buildTimetablePrompt } from "./promptBuilder.js";
import { prepareExamsData, prepareRevisionTimes } from "./helpers/dataPreparer.js";
import { parseChatGPTResponse } from "./helpers/responseParser.js";

/**
 * callChatGPTForTimetable
 * Calls the OpenAI API with the model "o1"
 * to generate a timetable based on user data (exams, preferences).
 * Expects the model to return a JSON array of objects:
 * [
 *   {
 *     "date": "YYYY-MM-DD",
 *     "block": "Morning/Afternoon/Evening",
 *     "subject": "Subject Name",
 *     "startTime": "HH:MM",
 *     "endTime": "HH:MM"
 *   }
 * ]
 */
export async function callChatGPTForTimetable({
  userId,
  userPreferences,
  userExams,
  revisionTimesResult,
  blockTimesData,
}) {
  try {
    const examsData = prepareExamsData(userExams);
    const revisionTimes = prepareRevisionTimes(revisionTimesResult);

    const prompt = buildTimetablePrompt(examsData, userPreferences, revisionTimes, blockTimesData);

    console.log("[INFO] Sending prompt to OpenAI:", prompt);

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { "type": "json_object" }
    });

    console.log(completion);

    const rawResponse = JSON.parse(completion.choices.[0].message.content).revision_dates;
    const parsed = parseChatGPTResponse(rawResponse);

    const timetableData = parsed.map((entry) => ({
      userId: userId,
      date: entry.date,
      block: entry.block,
      subject: entry.subject,
      startTime: entry.startTime,
      endTime: entry.endTime,
      isUserCreated: false,
    }));

    return timetableData;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error calling ChatGPT for timetable:", error);
    throw error;
  }
}
