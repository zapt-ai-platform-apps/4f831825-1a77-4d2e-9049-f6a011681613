export function parseChatGPTResponse(arrayData) {
  if (!Array.isArray(arrayData)) {
    throw new Error("ChatGPT did not return a JSON array.");
  }

  for (const item of arrayData) {
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

  return arrayData;
}