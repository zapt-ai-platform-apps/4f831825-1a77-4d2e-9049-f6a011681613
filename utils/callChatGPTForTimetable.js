import * as Sentry from "@sentry/node";
import client from "./openaiClient.js";
import { buildTimetablePrompt } from "./promptBuilder.js";
import { prepareExamsData, prepareRevisionTimes } from "./helpers/dataPreparer.js";
import { parseChatGPTResponse } from "./helpers/responseParser.js";

/**
 * callChatGPTForTimetable
 * Calls the OpenAI API to generate a timetable based on user data.
 * Expects valid JSON in the "revision_dates" property, with only date, block, subject.
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

    const content = completion.choices[0].message.content;
    console.log("[DEBUG] Raw ChatGPT Content:", content);

    const parsedJSON = JSON.parse(content);
    console.log("[DEBUG] Raw revision data from ChatGPT:", parsedJSON.revision_dates);

    const timetableItems = parseChatGPTResponse(parsedJSON.revision_dates);

    // For each item, we store their block, date, subject, but no start/end time
    const timetableData = timetableItems.map((entry) => ({
      userId: userId,
      date: entry.date,
      block: entry.block,
      subject: entry.subject,
      startTime: null, // ChatGPT no longer provides these
      endTime: null,   // ChatGPT no longer provides these
      isUserCreated: false,
    }));

    return timetableData;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error calling ChatGPT for timetable:", error);
    throw error;
  }
}