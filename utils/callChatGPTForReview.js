import * as Sentry from "@sentry/node";
import client from "./openaiClient.js";
import { buildReviewPrompt } from "./buildReviewPrompt.js";
import { parseChatGPTResponse } from "./parseChatGPTResponse.js";

/**
 * callChatGPTForReview
 * We pass our locally generated schedule to ChatGPT for a "review" or "adjustments."
 * If ChatGPT returns a valid schedule, we use it. If it fails or the format is invalid, we keep ours.
 *
 * The user wants a final JSON array:
 * {
 *   "revision_dates": [
 *     { "date": "YYYY-MM-DD", "block": "Morning", "subject": "..." },
 *     ...
 *   ]
 * }
 */
export async function callChatGPTForReview(userId, localTimetable) {
  const prompt = buildReviewPrompt(localTimetable);

  try {
    console.log("[INFO] Sending local schedule to ChatGPT for review...");

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

    const content = completion.choices[0].message.content;
    console.log("[DEBUG] ChatGPT review content:", content);

    const revisedTimetable = parseChatGPTResponse(content);

    return revisedTimetable;
  } catch (err) {
    Sentry.captureException(err);
    console.error("Error in callChatGPTForReview:", err);
    throw err;
  }
}