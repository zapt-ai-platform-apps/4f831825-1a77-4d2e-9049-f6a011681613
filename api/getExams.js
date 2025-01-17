import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import { db } from "../utils/dbClient.js";
import { exams } from "../drizzle/schema.js";
import { eq, gte, and } from "drizzle-orm";
import { format } from "date-fns";

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
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    const today = format(new Date(), 'yyyy-MM-dd');

    const result = await db
      .select()
      .from(exams)
      .where(
        and(eq(exams.userId, user.id), gte(exams.examDate, today))
      )
      .orderBy(exams.examDate);

    res.status(200).json({ data: result });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching exams:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}