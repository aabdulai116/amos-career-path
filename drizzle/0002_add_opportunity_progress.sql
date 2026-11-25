CREATE TABLE "opportunity_progress" (
	"user_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"deadline" text DEFAULT '' NOT NULL,
	"interested" boolean DEFAULT false NOT NULL,
	"applied" boolean DEFAULT false NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "opportunity_progress_user_id_opportunity_id_pk" PRIMARY KEY("user_id","opportunity_id")
);
--> statement-breakpoint
ALTER TABLE "opportunity_progress" ADD CONSTRAINT "opportunity_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;