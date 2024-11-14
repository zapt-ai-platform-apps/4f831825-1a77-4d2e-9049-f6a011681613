import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  jsonb,
  date,
} from "drizzle-orm/pg-core";

export const jokes = pgTable("jokes", {
  id: serial("id").primaryKey(),
  setup: text("setup").notNull(),
  punchline: text("punchline").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: uuid("user_id").notNull(),
});

export const preferences = pgTable("preferences", {
  userId: uuid("user_id").primaryKey(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  subject: text("subject").notNull(),
  examDate: date("exam_date").notNull(),
  board: text("board"),
  teacher: text("teacher"),
  createdAt: timestamp("created_at").defaultNow(),
});