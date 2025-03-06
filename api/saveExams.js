import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import { db } from "../src/modules/core/internal/dbClient.js";
import { exams } from "../drizzle/schema.js";

Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
  initialScope: {
    tags: {
      type: "backend",
      projectId: process.env.VITE_PUBLIC_APP_ID,
    },
  },
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    const body = req.body;
    const { data: examData } = body;

    if (!examData) {
      return res.status(400).json({ error: "Exam data is required" });
    }

    const { subject, examDate, timeOfDay, board, examColour } = examData;

    if (!subject || !examDate) {
      return res.status(400).json({ error: "Subject and Exam Date are required" });
    }

    const validTimeOfDay = ["Morning", "Afternoon", "Evening"];
    const examTimeOfDay = validTimeOfDay.includes(timeOfDay) ? timeOfDay : 'Morning';

    await db.insert(exams).values({
      userId: user.id,
      subject: subject,
      examDate: examDate,
      timeOfDay: examTimeOfDay,
      board: board,
      examColour: examColour,
    });

    res.status(200).json({ message: "Exam saved" });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error saving exam:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}