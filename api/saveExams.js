import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { exams } from "../drizzle/schema.js";
import getRawBody from "raw-body";

import { eq } from "drizzle-orm";

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

    const bodyBuffer = await getRawBody(req);
    const bodyString = bodyBuffer.toString("utf-8");
    let body;
    try {
      body = JSON.parse(bodyString);
    } catch (e) {
      throw new Error("Invalid JSON");
    }

    const { data } = body;

    if (!data) {
      return res.status(400).json({ error: "Exam data is required" });
    }

    const sql = neon(process.env.NEON_DB_URL);
    const db = drizzle(sql);

    await db.insert(exams).values({
      userId: user.id,
      subject: data.subject,
      examDate: data.examDate,
      board: data.board,
      teacher: data.teacher,
    });

    res.status(200).json({ message: "Exam saved" });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error saving exam:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}