import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { exams } from "../drizzle/schema.js";
import getRawBody from "raw-body";
import { eq, and } from "drizzle-orm";

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
    if (req.method !== "PUT") {
      res.setHeader("Allow", ["PUT"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    const bodyBuffer = await getRawBody(req);
    const bodyString = bodyBuffer.toString("utf-8");
    let body;
    try {
      body = JSON.parse(bodyString);
    } catch (e) {
      throw new Error("Invalid JSON");
    }

    const { id, subject, examDate, timeOfDay, board, teacher } = body.data;

    if (!id || !subject || !examDate) {
      return res
        .status(400)
        .json({ error: "ID, Subject, and Exam Date are required" });
    }

    const validTimeOfDay = ["Morning", "Afternoon", "Evening"];
    const examTimeOfDay = validTimeOfDay.includes(timeOfDay)
      ? timeOfDay
      : "Morning";

    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    const result = await db
      .update(exams)
      .set({
        subject: subject,
        examDate: examDate,
        timeOfDay: examTimeOfDay,
        board: board,
        teacher: teacher,
      })
      .where(and(eq(exams.id, id), eq(exams.userId, user.id)));

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Exam not found" });
    }

    res.status(200).json({ message: "Exam updated" });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error updating exam:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}