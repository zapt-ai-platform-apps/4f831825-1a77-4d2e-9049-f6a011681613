import Sentry from "../utils/sentry.js";
import { generateTimetableHandler } from "../services/generateTimetableService.js";

export default async function handler(req, res) {
  res.setTimeout(300000); // Set timeout to 300 seconds
  await generateTimetableHandler(req, res, Sentry);
}