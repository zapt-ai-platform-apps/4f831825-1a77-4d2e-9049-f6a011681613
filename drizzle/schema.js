import {
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  date,
  time,
  primaryKey,
  boolean,
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
  timeOfDay: text("time_of_day").default('Morning'),
  board: text("board"),
  teacher: text("teacher"),
  examColour: text("exam_colour"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timetableEntries = pgTable(
  "timetable_entries",
  {
    userId: uuid("user_id").notNull(),
    date: date("date").notNull(),
    block: text("block").notNull(),
    subject: text("subject").notNull(),
    startTime: time("start_time"),
    endTime: time("end_time"),
    isUserCreated: boolean("is_user_created").default(false),
    isComplete: boolean("is_complete").default(false),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.date, table.block),
  })
);

export const blockTimes = pgTable(
  "block_times",
  {
    userId: uuid("user_id").notNull(),
    blockName: text("block_name").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.blockName),
  })
);

export const periodSpecificAvailability = pgTable(
  "period_specific_availability",
  {
    userId: uuid("user_id").notNull(),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    dayOfWeek: text("day_of_week").notNull(),
    block: text("block").notNull(),
    isAvailable: boolean("is_available").default(true),
  },
  (table) => ({
    pk: primaryKey(table.userId, table.startDate, table.endDate, table.dayOfWeek, table.block),
  })
);