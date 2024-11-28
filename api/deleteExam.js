import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { exams } from "../drizzle/schema.js";
import { eq, and } from "drizzle-orm";
import getRawBody from "raw-body";

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
    if (req.method !== "DELETE") {
      res.setHeader("Allow", ["DELETE"]);
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

    const { id } = body;

    if (!id) {
      return res.status(400).json({ error: "Exam ID is required" });
    }

    const client = postgres(process.env.COCKROACH_DB_URL);
    const db = drizzle(client);

    await db.delete(exams).where(
      and(eq(exams.id, id), eq(exams.userId, user.id))
    );

    res.status(200).json({ message: "Exam deleted" });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error deleting exam:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}