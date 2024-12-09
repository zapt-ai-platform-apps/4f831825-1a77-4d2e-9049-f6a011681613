import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const client = postgres(process.env.COCKROACH_DB_URL);
export const db = drizzle(client);