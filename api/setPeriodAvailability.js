import { authenticateUser, Sentry } from "./_apiUtils.js";
import { db } from "./_dbClient.js";
import { periodSpecificAvailability } from "../drizzle/schema.js";
import { and, eq, between } from "drizzle-orm";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Authenticate user
    const user = await authenticateUser(req);
    const userId = user.id;

    // Get availability data from request body
    const { startDate, endDate, availability } = req.body;
    
    if (!startDate || !endDate || !availability || !Array.isArray(availability)) {
      return res.status(400).json({ error: "Start date, end date, and availability array are required" });
    }

    console.log(`Setting period-specific availability for user ${userId} from ${startDate} to ${endDate}`);

    // Start a transaction
    await db.transaction(async (tx) => {
      // First, delete any existing availability settings for this period
      await tx
        .delete(periodSpecificAvailability)
        .where(
          and(
            eq(periodSpecificAvailability.userId, userId),
            between(periodSpecificAvailability.startDate, startDate, endDate),
            between(periodSpecificAvailability.endDate, startDate, endDate)
          )
        );

      // Insert the new availability settings
      const availabilityRecords = availability.map(item => ({
        userId: userId,
        startDate: startDate,
        endDate: endDate,
        dayOfWeek: item.dayOfWeek,
        block: item.block,
        isAvailable: item.isAvailable
      }));

      if (availabilityRecords.length > 0) {
        await tx.insert(periodSpecificAvailability).values(availabilityRecords);
      }
    });

    console.log("Successfully set period-specific availability");
    return res.status(200).json({ message: "Period availability set successfully" });
  } catch (error) {
    console.error("Error setting period availability:", error);
    Sentry.captureException(error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}