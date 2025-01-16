/**
 * Parses and validates the response from ChatGPT.
 * We're expecting a JSON object with "updated_sessions": an array of
 * { id: string, subject: string } objects.
 *
 * If there are no changes, "updated_sessions" could be an empty array.
 *
 * @param {string} content - The JSON string returned by ChatGPT.
 * @returns {Array} - An array of updated session objects, each { id, subject }.
 * @throws Will throw an error if the JSON is invalid or the structure is incorrect.
 */
export function parseChatGPTResponse(content) {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new Error("Invalid JSON from ChatGPT review");
  }

  if (!parsed.updated_sessions || !Array.isArray(parsed.updated_sessions)) {
    throw new Error('ChatGPT did not return a valid "updated_sessions" array.');
  }

  // Validate each updated session
  for (const item of parsed.updated_sessions) {
    if (!item.id || typeof item.subject !== 'string') {
      throw new Error("Invalid updated session structure. Each must have { id, subject }.");
    }
  }

  // Return the array of updated sessions
  return parsed.updated_sessions;
}