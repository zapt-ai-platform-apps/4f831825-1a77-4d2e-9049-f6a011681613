import * as Sentry from "@sentry/node";
import client from "./openaiClient.js";
import { buildTimetablePrompt } from "./promptBuilder.js";
import { parseChatGPTResponse } from "./helpers/responseParser.js";

/**
 * callChatGPTForTimetable
 * Takes an array of blank sessions + array of exams, builds a prompt,
 * calls ChatGPT, and returns the filled timetable data.
 */
export async function callChatGPTForTimetable({
  userId,
  examsData,
  blankSessions,
}) {
  try {
    // Build prompt using only blankSessions + examsData
    const prompt = buildTimetablePrompt(examsData, blankSessions);
    console.log("[INFO] Sending prompt to OpenAI:", prompt);

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    console.log(completion);

    const content = completion.choices[0].message.content;
    console.log("[DEBUG] Raw ChatGPT Content:", content);

    const parsedJSON = JSON.parse(content);
    console.log("[DEBUG] Raw revision data from ChatGPT:", parsedJSON.revision_dates);

    const timetableItems = parseChatGPTResponse(parsedJSON.revision_dates);

    // Return the final data with userId appended
    const timetableData = timetableItems.map((entry) => ({
      userId,
      date: entry.date,
      block: entry.block,
      subject: entry.subject,
      startTime: null,
      endTime: null,
      isUserCreated: false,
    }));

    return timetableData;
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error calling ChatGPT for timetable:", error);
    throw error;
  }
}