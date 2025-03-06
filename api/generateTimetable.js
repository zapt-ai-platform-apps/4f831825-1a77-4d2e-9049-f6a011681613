import { authenticateUser, Sentry } from "./_apiUtils.js";

export default async function handler(req, res) {
  try {
    res.status(200).json({ 
      message: "Timetable generation should be done on the client side now. Please use the client-side timetable generator and call /api/saveTimetable to save the generated timetable." 
    });
  } catch (error) {
    console.error("Error in generateTimetable API:", error);
    Sentry.captureException(error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}