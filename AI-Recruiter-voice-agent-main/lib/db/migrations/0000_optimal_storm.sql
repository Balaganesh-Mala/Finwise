CREATE TYPE "public"."candidate_status" AS ENUM('new', 'reviewing', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('entry', 'junior', 'mid', 'senior', 'lead', 'executive');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('active', 'draft', 'closed');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('full-time', 'part-time', 'contract', 'internship', 'remote');--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"location" text,
	"current_title" text,
	"current_company" text,
	"linkedin_url" text,
	"portfolio_url" text,
	"resume_url" text,
	"resume_text" text,
	"resume_file_name" text,
	"strengths" text,
	"weaknesses" text,
	"ai_summary" text,
	"skills" text,
	"experience_years" text,
	"status" "candidate_status" DEFAULT 'new',
	"notes" text,
	"tags" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"candidate_id" integer NOT NULL,
	"candidate_email" text NOT NULL,
	"job_id" integer,
	"job_title" text,
	"interview_type" text,
	"interview_id" text,
	"screening_link" text,
	"unique_interview_link" text,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"interview_id" text NOT NULL,
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
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interview_sessions_interview_id_unique" UNIQUE("interview_id")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"department" text,
	"location" text,
	"type" "job_type" DEFAULT 'full-time',
	"experience_level" "experience_level" DEFAULT 'mid',
	"salary_min" text,
	"salary_max" text,
	"salary_currency" text DEFAULT 'USD',
	"description" text,
	"requirements" text,
	"responsibilities" text,
	"skills" text,
	"status" "job_status" DEFAULT 'draft',
	"matched_candidates" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
