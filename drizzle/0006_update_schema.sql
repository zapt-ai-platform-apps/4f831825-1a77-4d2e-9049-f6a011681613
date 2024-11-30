-- Remove existing preferences and timetables tables
DROP TABLE IF EXISTS preferences;
DROP TABLE IF EXISTS timetables;

-- Create new preferences table
CREATE TABLE "preferences" (
  "user_id" UUID PRIMARY KEY,
  "start_date" DATE NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW()
);

-- Create revision_times table
CREATE TABLE "revision_times" (
  "user_id" UUID NOT NULL,
  "day_of_week" TEXT NOT NULL,
  "block" TEXT NOT NULL,
  PRIMARY KEY ("user_id", "day_of_week", "block")
);

-- Create timetable_entries table
CREATE TABLE "timetable_entries" (
  "user_id" UUID NOT NULL,
  "date" DATE NOT NULL,
  "block" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  PRIMARY KEY ("user_id", "date", "block")
);