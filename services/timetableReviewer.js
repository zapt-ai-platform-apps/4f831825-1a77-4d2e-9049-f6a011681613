import { callChatGPTForReview } from "../utils/callChatGPTForReview.js";
import * as Sentry from "@sentry/node";

export async function reviewTimetable(userId, localTimetable) {
  let finalTimetable = localTimetable;
  try {
    const updatedSessions = await callChatGPTForReview(userId, localTimetable);
    if (updatedSessions && updatedSessions.length > 0) {
      finalTimetable = localTimetable.map((originalSession) => {
        const match = updatedSessions.find((us) => us.id === originalSession.id);
        if (match) {
          return { ...originalSession, subject: match.subject };
        }
        return originalSession;
      });
    }
  } catch (reviewError) {
    console.error("ChatGPT review failed, using local timetable:", reviewError);
    Sentry.captureException(reviewError);
  }
  return finalTimetable;
}