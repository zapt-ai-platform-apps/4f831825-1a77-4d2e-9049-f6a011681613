import { createOpenAIClient } from './openaiClient.js';
import { buildReviewPrompt } from './buildReviewPrompt.js';
import { parseResponse } from './responseParser.js';
import * as Sentry from "@sentry/node";

/**
 * Sends a timetable to ChatGPT for review and improvement suggestions
 * @param {string} userId - User ID
 * @param {Array} timetable - Array of timetable entries
 * @returns {Promise<Array>} Array of suggested changes
 */
export async function callChatGPTForReview(userId, timetable) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log("[INFO] Skipping ChatGPT review - no API key found");
      return [];
    }
    
    // Build the prompt for ChatGPT
    const prompt = buildReviewPrompt(userId, timetable);
    if (!prompt) return [];
    
    console.log("[INFO] Sending timetable to ChatGPT for review");
    
    // Create OpenAI client and send request
    const openai = createOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert educational advisor who helps students create balanced revision timetables."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    
    // Extract and parse the AI's response
    const rawResponse = completion.choices[0]?.message?.content;
    if (!rawResponse) {
      console.log("[WARN] Empty response from ChatGPT");
      return [];
    }
    
    return parseResponse(rawResponse);
  } catch (error) {
    console.error("[ERROR] ChatGPT review failed:", error);
    Sentry.captureException(error);
    return [];
  }
}