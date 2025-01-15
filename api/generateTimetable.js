import Sentry from "../utils/sentry.js";
import { generateTimetableHandler } from "../services/generateTimetableService.js";

export default async function handler(req, res) {
  await generateTimetableHandler(req, res, Sentry);
}