import * as Sentry from "@sentry/node";
import client from "./openaiClient.js";
import { buildReviewPrompt } from "./buildReviewPrompt.js";
import { parseChatGPTResponse } from "./parseChatGPTResponse.js";

/**
 * callChatGPTForReview
 * We pass our locally generated schedule (with IDs) to ChatGPT for a "review."
 * ChatGPT should return only the sessions it modifies, with { "updated_sessions": [{id, subject}, ...] }.
 *
 * If no changes are needed, ChatGPT returns { "updated_sessions": [] }.
 * We return an array of updated session objects from parseChatGPTResponse, each containing { id, subject }.
 */
export async function callChatGPTForReview(userId, localTimetable) {
  const prompt = buildReviewPrompt(localTimetable);

  try {
    console.log("[INFO] Sending local schedule to ChatGPT for partial update check...");

    // Example call; adjust as needed for your OpenAI library usage
    const completion = await client.chat.completions.create({
      model: "gpt-4o", // or whichever model is appropriate
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      // Possibly no special response format needed beyond valid JSON
      // We'll rely on parseChatGPTResponse to confirm correctness
    });

    const content = completion.choices[0].message.content;
    console.log("[DEBUG] ChatGPT partial-update content:", content);

    const updatedSessions = parseChatGPTResponse(content);

    return updatedSessions;
  } catch (err) {
    Sentry.captureException(err);
    console.error("Error in callChatGPTForReview:", err);
    throw err;
  }
}