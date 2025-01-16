export function parseChatGPTResponse(arrayData) {
  if (!Array.isArray(arrayData)) {
    throw new Error("ChatGPT did not return a JSON array.");
  }

  for (const item of arrayData) {
    if (
      typeof item.date !== "string" ||
      typeof item.block !== "string" ||
      typeof item.subject !== "string"
    ) {
      throw new Error("Invalid timetable item fields from ChatGPT (only date, block, subject required).");
    }
  }

  // Return the items directly, as they only have date, block, subject
  return arrayData;
}