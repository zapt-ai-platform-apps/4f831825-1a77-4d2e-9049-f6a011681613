CREATE TABLE "exams" (
  "id" SERIAL PRIMARY KEY,
  "user_id" UUID NOT NULL,
  "subject" TEXT NOT NULL,
  "exam_date" DATE NOT NULL,
  "board" TEXT,
  "teacher" TEXT,
  "created_at" TIMESTAMP DEFAULT NOW()
);