CREATE TABLE "timetables" (
  "user_id" UUID PRIMARY KEY,
  "data" JSONB NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW()
);