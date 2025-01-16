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
    });

    let content = completion.choices[0].message.content;
    console.log("[DEBUG] ChatGPT partial-update content (before sanitization):", content);

    // Sanitize the response to remove any unwanted code blocks or extra text
    const sanitizedContent = content
      .replace(/```json([\s\S]*?)```/gi, '$1')
      .replace(/```([\s\S]*?)```/gi, '$1');
    console.log("[DEBUG] ChatGPT partial-update content (after sanitization):", sanitizedContent);

    const updatedSessions = parseChatGPTResponse(sanitizedContent);

    return updatedSessions;
  } catch (err) {
    Sentry.captureException(err);
    console.error("Error in callChatGPTForReview:", err);
    throw err;
  }
}