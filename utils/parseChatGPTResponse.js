/**
 * Parses and validates the response from ChatGPT.
 *
 * @param {string} content - The JSON string returned by ChatGPT.
 * @returns {Array} - The revised timetable.
 * @throws Will throw an error if the JSON is invalid or the structure is incorrect.
 */
export function parseChatGPTResponse(content) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error("Invalid JSON from ChatGPT review");
  }

  if (!parsed.revision_dates || !Array.isArray(parsed.revision_dates)) {
    throw new Error("ChatGPT did not return a valid 'revision_dates' array.");
  }

  for (const item of parsed.revision_dates) {
    if (!item.date || !item.block || !item.subject) {
      throw new Error("Invalid item in ChatGPT's revised schedule.");
    }
  }

  const revisedTimetable = parsed.revision_dates.map((d) => ({
    date: d.date,
    block: d.block,
    subject: d.subject,
  }));

  return revisedTimetable;
}