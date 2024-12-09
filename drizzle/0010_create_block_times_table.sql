CREATE TABLE "block_times" (
  "user_id" UUID NOT NULL,
  "block_name" TEXT NOT NULL,
  "start_time" TIME NOT NULL,
  "end_time" TIME NOT NULL,
  PRIMARY KEY ("user_id", "block_name")
);