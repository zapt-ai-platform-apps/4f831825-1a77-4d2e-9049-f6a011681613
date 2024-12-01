import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  date,
  primaryKey,
} from "drizzle-orm/pg-core";

export const preferences = pgTable("preferences", {
  userId: uuid("user_id").primaryKey(),
  startDate: date("start_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const revisionTimes = pgTable(
  "revision_times",
  {
    userId: uuid("user_id").notNull(),
    dayOfWeek: text("day_of_week").notNull(),
    block: text("block").notNull(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.dayOfWeek, table.block),
  })
);

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  subject: text("subject").notNull(),
  examDate: date("exam_date").notNull(),
  board: text("board"),
  teacher: text("teacher"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timetableEntries = pgTable(
  "timetable_entries",
  {
    userId: uuid("user_id").notNull(),
    date: date("date").notNull(),
    block: text("block").notNull(),
    subject: text("subject").notNull(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.date, table.block),
  })
);