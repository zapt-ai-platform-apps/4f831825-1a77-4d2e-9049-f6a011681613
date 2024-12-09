import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { preferences, revisionTimes, timetableEntries, blockTimes } from "../drizzle/schema.js";

const client = postgres(process.env.COCKROACH_DB_URL);
const db = drizzle(client);

export { db, preferences, revisionTimes, timetableEntries, blockTimes };