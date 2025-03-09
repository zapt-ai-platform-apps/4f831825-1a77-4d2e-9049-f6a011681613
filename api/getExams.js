import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import { db } from "./_dbClient.js";
import { exams } from "../drizzle/schema.js";
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
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    // Removed the date filter to show all exams including past ones
    const result = await db
      .select()
      .from(exams)
      .where(eq(exams.userId, user.id))
      .orderBy(exams.examDate);

    console.log(`Retrieved ${result.length} exams for user ${user.id}, including past exams`);
    
    res.status(200).json({ data: result });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Error fetching exams:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}