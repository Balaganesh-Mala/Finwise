CREATE TABLE IF NOT EXISTS "interview_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"interview_id" text NOT NULL UNIQUE,
	"candidate_name" text NOT NULL,
	"candidate_email" text,
	"job_title" text,
	"job_description" text,
	"transcript" text,
	"ai_summary" text,
	"duration_seconds" integer,
	"questions_asked" integer,
	"status" text DEFAULT 'completed',
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
