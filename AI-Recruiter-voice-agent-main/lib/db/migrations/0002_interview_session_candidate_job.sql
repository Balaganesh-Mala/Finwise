-- Add candidateId and jobId columns to interview_sessions table
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "candidate_id" integer;
ALTER TABLE "interview_sessions" ADD COLUMN IF NOT EXISTS "job_id" integer;
