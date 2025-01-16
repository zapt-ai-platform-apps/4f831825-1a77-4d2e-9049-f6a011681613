import * as Sentry from "@sentry/node";
import client from "./openaiClient.js";
import { buildTimetablePrompt } from "./promptBuilder.js";
import { parseChatGPTResponse } from "./helpers/responseParser.js";
/**
 * We are removing the filtering that discards exam-day or post-exam sessions.
 * Now all sessions ChatGPT returns will remain in the timetable.
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

    let timetableItems = parseChatGPTResponse(parsedJSON.revision_dates);

    // Remove the filter so that no sessions are dropped
    const finalItems = timetableItems;

    // Return the final data with userId appended
    const timetableData = finalItems.map((entry) => ({
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