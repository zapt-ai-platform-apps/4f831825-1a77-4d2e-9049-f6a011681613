import { callChatGPTForReview } from "../../../utils/callChatGPTForReview.js";
import * as Sentry from "@sentry/node";

/**
 * Reviews timetable using ChatGPT and applies suggested changes
 * @param {string} userId - User ID
 * @param {Array} timetable - Array of timetable entries
 * @returns {Array} Improved timetable entries
 */
export async function reviewTimetable(userId, timetable) {
  try {
    // Skip review if there are no entries or OpenAI API is unavailable
    if (!timetable.length || !process.env.OPENAI_API_KEY) {
      return timetable;
    }
    
    // Get update suggestions from ChatGPT
    const updatedSessions = await callChatGPTForReview(userId, timetable);
    
    // If no updates suggested, return original timetable
    if (!updatedSessions || updatedSessions.length === 0) {
      console.log("[INFO] ChatGPT review completed with no changes.");
      return timetable;
    }
    
    console.log(`[INFO] ChatGPT suggested ${updatedSessions.length} changes to timetable.`);
    
    // Apply suggested updates
    const updatedTimetable = timetable.map(session => {
      const update = updatedSessions.find(update => update.id === session.id);
      
      if (update) {
        return {
          ...session,
          subject: update.subject
        };
      }
      
      return session;
    });
    
    return updatedTimetable;
  } catch (error) {
    // Log error but don't fail timetable generation
    console.error("[ERROR] ChatGPT review failed:", error);
    Sentry.captureException(error);
    return timetable;
  }
}