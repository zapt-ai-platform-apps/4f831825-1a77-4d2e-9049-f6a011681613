/**
 * Parses the ChatGPT response to extract session update recommendations
 * @param {string} response - Raw response from ChatGPT
 * @returns {Array} Array of session updates
 */
export function parseResponse(response) {
  try {
    // Extract JSON from the response (in case there's text around it)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[ERROR] No valid JSON found in ChatGPT response");
      return [];
    }
    
    // Parse the JSON content
    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    // Extract and log the feedback
    if (parsedResponse.feedback) {
      console.log("[INFO] ChatGPT feedback:", parsedResponse.feedback);
    }
    
    // Return the suggested changes
    return Array.isArray(parsedResponse.changes) ? parsedResponse.changes : [];
  } catch (error) {
    console.error("[ERROR] Failed to parse ChatGPT response:", error);
    return [];
  }
}