/**
 * Run pending SQL migrations directly against the Neon database.
 * Usage: npx tsx --env-file=.env scripts/run-migration.ts
 */
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
  console.log("🚀 Running pending migrations...\n");

  // Step 1: Create interview_sessions table with all columns (IF NOT EXISTS)
  try {
    console.log("📋 Creating interview_sessions table (if not exists)...");
    await sql`
      CREATE TABLE IF NOT EXISTS "interview_sessions" (
        "id" serial PRIMARY KEY NOT NULL,
        "interview_id" text NOT NULL UNIQUE,
        "candidate_name" text NOT NULL,
        "candidate_email" text,
        "candidate_id" integer,
        "job_id" integer,
        "job_title" text,
        "job_description" text,
        "transcript" text,
        "ai_summary" text,
        "duration_seconds" integer,
        "questions_asked" integer,
        "status" text DEFAULT 'completed',
        "completed_at" timestamp DEFAULT now() NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log("✅ interview_sessions table ready\n");
  } catch (err: any) {
    console.error("❌ Table creation failed:", err.message);
  }

  // Step 2: Add candidate_id column if not exists
  try {
    console.log("📋 Adding candidate_id column (if not exists)...");
    await sql`ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "candidate_id" integer`;
    console.log("✅ candidate_id column ready");
  } catch (err: any) {
    console.error("❌ Adding candidate_id failed:", err.message);
  }

  // Step 3: Add job_id column if not exists
  try {
    console.log("📋 Adding job_id column (if not exists)...");
    await sql`ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "job_id" integer`;
    console.log("✅ job_id column ready\n");
  } catch (err: any) {
    console.error("❌ Adding job_id failed:", err.message);
  }

  // Step 4: Verify the table structure
  try {
    console.log("📋 Verifying table structure...");
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'interview_sessions' 
      ORDER BY ordinal_position
    `;
    console.log("✅ interview_sessions columns:");
    result.forEach((row: any) => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
  } catch (err: any) {
    console.error("❌ Verification failed:", err.message);
  }

  // Step 5: Create recruiter_settings table (IF NOT EXISTS)
  try {
    console.log("📋 Creating recruiter_settings table (if not exists)...");
    await sql`
      CREATE TABLE IF NOT EXISTS "recruiter_settings" (
        "id" serial PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL UNIQUE,
        "screening_questions_count" integer DEFAULT 6,
        "tech_questions_count" integer DEFAULT 8,
        "hr_questions_count" integer DEFAULT 5,
        "silence_timeout_seconds" integer DEFAULT 3,
        "auto_end_interview" boolean DEFAULT true,
        "ai_voice_id" text DEFAULT 'en-US-falcon',
        "ai_interviewer_name" text DEFAULT 'Alex',
        "interview_tone" text DEFAULT 'professional',
        "screening_prompt" text,
        "tech_prompt" text,
        "hr_prompt" text,
        "closing_message" text,
        "evaluation_strictness" text DEFAULT 'balanced',
        "company_name" text,
        "recruiter_display_name" text,
        "custom_email_subject" text,
        "custom_email_intro" text,
        "reply_to_email" text,
        "invite_expiry_days" integer DEFAULT 7,
        "company_logo_url" text,
        "notify_on_complete" boolean DEFAULT true,
        "notification_email" text,
        "low_score_alert" boolean DEFAULT false,
        "low_score_threshold" integer DEFAULT 5,
        "industry" text,
        "default_location" text,
        "default_currency" text DEFAULT 'USD',
        "timezone" text DEFAULT 'UTC',
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log("✅ recruiter_settings table ready\n");
  } catch (err: any) {
    console.error("❌ recruiter_settings table creation failed:", err.message);
  }

  // Step 6: Verify recruiter_settings table structure
  try {
    console.log("📋 Verifying recruiter_settings table structure...");
    const result = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'recruiter_settings' 
      ORDER BY ordinal_position
    `;
    console.log("✅ recruiter_settings columns:");
    result.forEach((row: any) => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
  } catch (err: any) {
    console.error("❌ Verification failed:", err.message);
  }

  console.log("\n🎉 Migration complete!");
}

runMigration().catch(console.error);
