import { authenticateUser, Sentry } from "./_apiUtils.js";
import { db } from "./_dbClient.js";
import { periodSpecificAvailability } from "../drizzle/schema.js";
import { and, eq } from "drizzle-orm";

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const user = await authenticateUser(req);
    const { data: entries } = req.body;
    
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    console.log(`Saving ${entries.length} period-specific availability entries for user ${user.id}`);

    // Process each entry
    for (const entry of entries) {
      const { startDate, endDate, dayOfWeek, block, isAvailable } = entry;
      
      if (!startDate || !endDate || !dayOfWeek || !block) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Check if entry already exists
      const existingEntry = await db
        .select()
        .from(periodSpecificAvailability)
        .where(
          and(
            eq(periodSpecificAvailability.userId, user.id),
            eq(periodSpecificAvailability.startDate, startDate),
            eq(periodSpecificAvailability.endDate, endDate),
            eq(periodSpecificAvailability.dayOfWeek, dayOfWeek),
            eq(periodSpecificAvailability.block, block)
          )
        );
      
      if (existingEntry.length > 0) {
        // Update existing entry
        await db
          .update(periodSpecificAvailability)
          .set({ isAvailable })
          .where(
            and(
              eq(periodSpecificAvailability.userId, user.id),
              eq(periodSpecificAvailability.startDate, startDate),
              eq(periodSpecificAvailability.endDate, endDate),
              eq(periodSpecificAvailability.dayOfWeek, dayOfWeek),
              eq(periodSpecificAvailability.block, block)
            )
          );
        console.log(`Updated entry for ${dayOfWeek} ${block} from ${startDate} to ${endDate}, available: ${isAvailable}`);
      } else {
        // Insert new entry
        await db
          .insert(periodSpecificAvailability)
          .values({
            userId: user.id,
            startDate,
            endDate,
            dayOfWeek,
            block,
            isAvailable: isAvailable !== undefined ? isAvailable : true
          });
        console.log(`Inserted new entry for ${dayOfWeek} ${block} from ${startDate} to ${endDate}, available: ${isAvailable}`);
      }
    }

    res.status(200).json({ message: 'Period-specific availability saved successfully' });
  } catch (error) {
    Sentry.captureException(error);
    console.error('Error saving period-specific availability:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}