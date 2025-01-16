import * as Sentry from "@sentry/node";
import client from "./openaiClient.js";
import { buildTimetablePrompt } from "./promptBuilder.js";
import { parseChatGPTResponse } from "./helpers/responseParser.js";
import { isBlockSameOrLater } from "./helpers/timetableHelper.js";

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

    let timetableItems = parseChatGPTResponse(parsedJSON.revision_dates);

    // Adjust filter logic to allow same-day revision if it's earlier than the exam block
    const filteredItems = timetableItems.filter((entry) => {
      const exam = examsData.find((e) => e.subject === entry.subject);
      if (!exam) return true; // If we don't even have an exam for this subject, keep it.

      // If entry is on the same calendar date as the exam
      if (entry.date === exam.examDate) {
        // Exclude only if the entry block is the same or later than the exam block
        return !isBlockSameOrLater(entry.block, exam.timeOfDay);
      }

      // If entry date is after exam date, exclude it
      if (entry.date > exam.examDate) {
        return false;
      }

      // Otherwise, keep it
      return true;
    });

    // Return the final data with userId appended
    const timetableData = filteredItems.map((entry) => ({
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