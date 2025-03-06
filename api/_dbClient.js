import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Initialize postgres client
const client = postgres(process.env.COCKROACH_DB_URL);

// Initialize drizzle orm
export const db = drizzle(client);