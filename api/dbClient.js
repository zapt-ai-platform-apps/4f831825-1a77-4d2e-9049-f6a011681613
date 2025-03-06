import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as Sentry from "@sentry/node";

let db;

/**
 * Gets a database client instance, creating one if it doesn't exist
 * @returns {Object} Drizzle ORM database client
 */
export function getDbClient() {
  if (!db) {
    const connectionString = process.env.COCKROACH_DB_URL;
    if (!connectionString) {
      throw new Error("Database connection string not found in environment variables");
    }
    
    try {
      const client = postgres(connectionString);
      db = drizzle(client);
      console.log("Database connection established");
    } catch (error) {
      console.error("Error connecting to database:", error);
      Sentry.captureException(error);
      throw error;
    }
  }
  
  return db;
}

// Export a singleton instance for direct use
export const db = getDbClient();