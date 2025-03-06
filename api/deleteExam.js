import * as Sentry from "@sentry/node";
import { authenticateUser } from "./_apiUtils.js";
import { db } from "./dbClient.js";
import { exams } from "../drizzle/schema.js";
import { eq, and } from "drizzle-orm";

export default async function handler(req, res) {
  try {
    if (req.method !== "DELETE") {
      res.setHeader("Allow", ["DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);

    const body = req.body;

    const { id } = body;

    if (!id) {
      return res.status(400).json({ error: "Exam ID is required" });
    }

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