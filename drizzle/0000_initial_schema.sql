CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "application" (
	"user_id" text NOT NULL,
	"listing_id" text NOT NULL,
	"stage" text NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "application_user_id_listing_id_pk" PRIMARY KEY("user_id","listing_id")
);
--> statement-breakpoint
CREATE TABLE "company_verdict" (
	"user_id" text NOT NULL,
	"company_key" text NOT NULL,
	"cpt" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_verdict_user_id_company_key_pk" PRIMARY KEY("user_id","company_key")
);
--> statement-breakpoint
CREATE TABLE "course_progress" (
	"user_id" text NOT NULL,
	"day" integer NOT NULL,
	"watched" boolean DEFAULT false NOT NULL,
	"project_done" boolean DEFAULT false NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"repo_url" text DEFAULT '' NOT NULL,
	"lecture_url" text DEFAULT '' NOT NULL,
	"exercises_done" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"exercise_code" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"completed_at" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_progress_user_id_day_pk" PRIMARY KEY("user_id","day")
);
--> statement-breakpoint
CREATE TABLE "custom_resource" (
	"user_id" text NOT NULL,
	"id" text NOT NULL,
	"skill_id" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"added_at" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "custom_resource_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "day_log" (
	"user_id" text NOT NULL,
	"date" text NOT NULL,
	"hours" real DEFAULT 0 NOT NULL,
	"resources" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "day_log_user_id_date_pk" PRIMARY KEY("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "problem_progress" (
	"user_id" text NOT NULL,
	"slug" text NOT NULL,
	"status" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"minutes" integer DEFAULT 0 NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"time_complexity" text DEFAULT '' NOT NULL,
	"space_complexity" text DEFAULT '' NOT NULL,
	"solution" text DEFAULT '' NOT NULL,
	"used_hint" boolean DEFAULT false NOT NULL,
	"solved_at" text,
	"last_attempt_at" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "problem_progress_user_id_slug_pk" PRIMARY KEY("user_id","slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_progress" (
	"user_id" text NOT NULL,
	"skill_id" text NOT NULL,
	"status" text,
	"notes" text DEFAULT '' NOT NULL,
	"proof_url" text DEFAULT '' NOT NULL,
	"hours_logged" real DEFAULT 0 NOT NULL,
	"completed_at" text,
	"resources_watched" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "skill_progress_user_id_skill_id_pk" PRIMARY KEY("user_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"recruiting_date" text NOT NULL,
	"selected_path_id" text,
	"internships_seen_at" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application" ADD CONSTRAINT "application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_verdict" ADD CONSTRAINT "company_verdict_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "custom_resource" ADD CONSTRAINT "custom_resource_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "day_log" ADD CONSTRAINT "day_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_progress" ADD CONSTRAINT "problem_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_progress" ADD CONSTRAINT "skill_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;