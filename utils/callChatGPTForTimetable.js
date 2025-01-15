import * as Sentry from "@sentry/node";
import openai from "./openaiClient.js";
import { buildTimetablePrompt } from "./promptBuilder.js";

/**
 * callChatGPTForTimetable
 * Calls the OpenAI API with the newly released model "o1"
 * to generate a timetable based on user data (exams, preferences).
 * Expects the model to return a JSON array of objects:
 * [
 *   {
 *     "date": "YYYY-MM-DD",
 *     "block": "Morning/Afternoon/Evening",
 *     "subject": "Subject Name",
 *     "startTime": "HH:MM",
 *     "endTime": "HH:MM"
 *   }
 * ]
 */
export async function callChatGPTForTimetable({
  userId,
  userPreferences,
  userExams,
  revisionTimesResult,
  blockTimesData,
}) {
  try {
    const examsData = userExams.map((e) => ({
      subject: e.subject,
      examDate: e.examDate,
      timeOfDay: e.timeOfDay,
    }));

    const revisionTimes = {};
    for (const row of revisionTimesResult) {
      if (!revisionTimes[row.dayOfWeek]) {
        revisionTimes[row.dayOfWeek] = [];
      }
      revisionTimes[row.dayOfWeek].push(row.block);
    }

    const prompt = buildTimetablePrompt(examsData, userPreferences, revisionTimes, blockTimesData);

    const completion = await openai.createChatCompletion({
      model: "o1",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const rawResponse = completion.data.choices[0]?.message?.content?.trim() || "";
    let parsed;
    try {
      parsed = JSON.parse(rawResponse);
    } catch (jsonErr) {
      throw new Error(`Failed to parse ChatGPT JSON response: ${jsonErr.message}`);
    }

    if (!Array.isArray(parsed)) {
      throw new Error("ChatGPT did not return a JSON array.");
    }

    for (const item of parsed) {
      if (
        typeof item.date !== "string" ||
        typeof item.block !== "string" ||
        typeof item.subject !== "string" ||
        typeof item.startTime !== "string" ||
        typeof item.endTime !== "string"
      ) {
        throw new Error("Invalid timetable item fields from ChatGPT.");
      }
    }

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
    throw error;
  }
}