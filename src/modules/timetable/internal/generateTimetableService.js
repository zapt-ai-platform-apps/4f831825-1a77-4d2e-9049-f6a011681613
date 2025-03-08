import * as Sentry from "@sentry/node";
import { generateTimetable } from "./timetableGenerator.js";
import { saveTimetable } from "./timetableSaver.js";

/**
 * @deprecated Timetable generation has been moved to client-side.
 * This file is maintained for reference and backwards compatibility.
 * For current implementation, see timetableGeneratorCore.js and the client-side API.
 */

/**
 * Process revision times from database format to a usable structure
 * @param {Array} revisionTimes - Revision times from database
 * @returns {Object} Processed revision times by day of week
 */
function processRevisionTimes(revisionTimes) {
  const processed = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  if (!revisionTimes || !Array.isArray(revisionTimes)) {
    console.warn("Invalid revision times format");
    return processed;
  }

  for (const row of revisionTimes) {
    if (row.dayOfWeek && row.block) {
      if (!processed[row.dayOfWeek]) {
        processed[row.dayOfWeek] = [];
      }
      processed[row.dayOfWeek].push(row.block);
    }
  }

  return processed;
}

/**
 * Main handler for timetable generation
 * @deprecated Use client-side generation instead
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 * @param {Object} Sentry - Sentry error tracking instance
 */
export async function generateTimetableHandler(req, res, Sentry) {
  try {
    console.warn("DEPRECATED: Using server-side timetable generation. Consider using client-side generation instead.");
    
    // Check if request contains necessary data
    if (!req.user || !req.user.id) {
      return res.status(400).json({ error: "User authentication is required" });
    }
    
    // Respond with deprecation notice
    return res.status(200).json({ 
      message: "Timetable generation should be done on the client side now. Please use the client-side timetable generator and call /api/saveTimetable to save the generated timetable.",
      deprecated: true
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error in deprecated timetable generation service:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}