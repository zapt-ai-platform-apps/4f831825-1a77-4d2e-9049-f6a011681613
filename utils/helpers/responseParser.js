export function parseChatGPTResponse(rawResponse) {
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

  return parsed;
}