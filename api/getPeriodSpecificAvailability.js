import { authenticateUser, Sentry } from "./_apiUtils.js";
import { db } from "./_dbClient.js";
import { periodSpecificAvailability } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);
    
    // Get all period-specific availability entries for this user
    const availabilityEntries = await db
      .select()
      .from(periodSpecificAvailability)
      .where(eq(periodSpecificAvailability.userId, user.id));

    res.status(200).json({ data: availabilityEntries });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error fetching period-specific availability:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}