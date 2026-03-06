import { pgTable, serial, text, timestamp, pgEnum, boolean, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    clerkId: text("clerk_id").notNull().unique(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emailInvites = pgTable("email_invites", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(), // Clerk user ID (recruiter)
    candidateId: integer("candidate_id").notNull(),
    candidateEmail: text("candidate_email").notNull(),
    jobId: integer("job_id"),
    jobTitle: text("job_title"),
    interviewType: text("interview_type"),
    interviewId: text("interview_id"), // Unique interview ID (e.g., "abc123def")
    screeningLink: text("screening_link"),
    uniqueInterviewLink: text("unique_interview_link"), // Full URL: domain.com/interview/{type}/{id}
    sentAt: timestamp("sent_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobTypeEnum = pgEnum("job_type", [
    "full-time",
    "part-time",
    "contract",
    "internship",
    "remote",
]);

export const experienceLevelEnum = pgEnum("experience_level", [
    "entry",
    "junior",
    "mid",
    "senior",
    "lead",
    "executive",
]);

export const jobStatusEnum = pgEnum("job_status", [
    "active",
    "draft",
    "closed",
]);

export const jobs = pgTable("jobs", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(), // Clerk user ID
    title: text("title").notNull(),
    department: text("department"),
    location: text("location"),
    type: jobTypeEnum("type").default("full-time"),
    experienceLevel: experienceLevelEnum("experience_level").default("mid"),
    salaryMin: text("salary_min"),
    salaryMax: text("salary_max"),
    salaryCurrency: text("salary_currency").default("USD"),
    description: text("description"),
    requirements: text("requirements"),
    responsibilities: text("responsibilities"),
    skills: text("skills"), // JSON array stored as text
    status: jobStatusEnum("status").default("draft"),
    matchedCandidates: text("matched_candidates"), // JSON array of matched candidate IDs with scores
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const candidateStatusEnum = pgEnum("candidate_status", [
    "new",
    "reviewing",
    "shortlisted",
    "interviewing",
    "offered",
    "hired",
    "rejected",
]);

export const candidates = pgTable("candidates", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(), // Clerk user ID (recruiter)
    // Personal info
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    location: text("location"),
    currentTitle: text("current_title"),
    currentCompany: text("current_company"),
    linkedinUrl: text("linkedin_url"),
    portfolioUrl: text("portfolio_url"),
    // Resume
    resumeUrl: text("resume_url"),       // URL/path to uploaded resume file
    resumeText: text("resume_text"),     // Extracted text from resume
    resumeFileName: text("resume_file_name"),
    // AI Analysis
    strengths: text("strengths"),        // JSON array of strength strings
    weaknesses: text("weaknesses"),      // JSON array of weakness strings
    aiSummary: text("ai_summary"),       // AI-generated overall summary
    skills: text("skills"),              // JSON array of detected skills
    experienceYears: text("experience_years"),
    // Status & notes
    status: candidateStatusEnum("status").default("new"),
    notes: text("notes"),
    tags: text("tags"),                  // JSON array of tags
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Recruiter Settings — per-recruiter configuration for AI agent behavior
export const recruiterSettings = pgTable("recruiter_settings", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().unique(), // Clerk user ID

    // ── Interview Settings ──────────────────────────────────────────────────
    screeningQuestionsCount: integer("screening_questions_count").default(6),
    techQuestionsCount: integer("tech_questions_count").default(8),
    hrQuestionsCount: integer("hr_questions_count").default(5),
    silenceTimeoutSeconds: integer("silence_timeout_seconds").default(3),
    autoEndInterview: boolean("auto_end_interview").default(true),
    aiVoiceId: text("ai_voice_id").default("en-US-falcon"),

    // ── AI Prompt Settings ──────────────────────────────────────────────────
    aiInterviewerName: text("ai_interviewer_name").default("Alex"),
    interviewTone: text("interview_tone").default("professional"), // professional | friendly | formal | conversational
    screeningPrompt: text("screening_prompt"),
    techPrompt: text("tech_prompt"),
    hrPrompt: text("hr_prompt"),
    closingMessage: text("closing_message"),
    evaluationStrictness: text("evaluation_strictness").default("balanced"), // strict | balanced | lenient

    // ── Email & Invite Settings ─────────────────────────────────────────────
    companyName: text("company_name"),
    recruiterDisplayName: text("recruiter_display_name"),
    customEmailSubject: text("custom_email_subject"),
    customEmailIntro: text("custom_email_intro"),
    replyToEmail: text("reply_to_email"),
    inviteExpiryDays: integer("invite_expiry_days").default(7),
    companyLogoUrl: text("company_logo_url"),

    // ── Notifications ───────────────────────────────────────────────────────
    notifyOnComplete: boolean("notify_on_complete").default(true),
    notificationEmail: text("notification_email"),
    lowScoreAlert: boolean("low_score_alert").default(false),
    lowScoreThreshold: integer("low_score_threshold").default(5),

    // ── Company Profile ─────────────────────────────────────────────────────
    industry: text("industry"),
    defaultLocation: text("default_location"),
    defaultCurrency: text("default_currency").default("USD"),
    timezone: text("timezone").default("UTC"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Interview Sessions — stores full transcript + AI summary for each completed interview
export const interviewSessions = pgTable("interview_sessions", {
    id: serial("id").primaryKey(),
    interviewId: text("interview_id").notNull().unique(), // matches emailInvites.interviewId
    candidateName: text("candidate_name").notNull(),
    candidateEmail: text("candidate_email"),
    candidateId: integer("candidate_id"),   // FK reference to candidates.id
    jobId: integer("job_id"),               // FK reference to jobs.id
    jobTitle: text("job_title"),
    jobDescription: text("job_description"),
    // Full Q&A transcript stored as JSON text
    transcript: text("transcript"), // JSON: [{role: "ai"|"user", content: string, timestamp: string}]
    // AI-generated summary stored as JSON text
    aiSummary: text("ai_summary"), // JSON: {overallScore, communicationScore, technicalScore, strengths[], concerns[], recommendation, summary}
    // Interview metadata
    durationSeconds: integer("duration_seconds"),
    questionsAsked: integer("questions_asked"),
    status: text("status").default("completed"), // "completed" | "abandoned"
    completedAt: timestamp("completed_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
