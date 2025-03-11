CREATE TABLE IF NOT EXISTS "period_specific_availability" (
  "user_id" UUID NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "day_of_week" TEXT NOT NULL,
  "block" TEXT NOT NULL,
  "is_available" BOOLEAN DEFAULT TRUE,
  PRIMARY KEY ("user_id", "start_date", "end_date", "day_of_week", "block")
);