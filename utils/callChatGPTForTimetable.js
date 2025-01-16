import * as Sentry from "@sentry/node";
import client from "./openaiClient.js";
import { buildTimetablePrompt } from "./promptBuilder.js";
import { prepareExamsData, prepareRevisionTimes } from "./helpers/dataPreparer.js";
import { parseChatGPTResponse } from "./helpers/responseParser.js";

/**
 * callChatGPTForTimetable
 * Calls the OpenAI API to generate a timetable based on user data.
 * Expects valid JSON in the "revision_dates" property.
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

    // Using createChatCompletion with a standard model
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format:{ "type": "json_object" }
    });

    console.log(completion.data);

    const content = completion.data.choices[0].message.content;
    // The model output is expected to have a top-level key "revision_dates" with an array
    const rawResponse = JSON.parse(content).revision_dates;

    // parseChatGPTResponse expects a JSON string, so we pass stringified rawResponse
    const parsed = parseChatGPTResponse(JSON.stringify(rawResponse));

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
