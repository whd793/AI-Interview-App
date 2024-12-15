CREATE TABLE IF NOT EXISTS "userCredits" (
	"id" serial PRIMARY KEY NOT NULL,
	"userEmail" varchar NOT NULL,
	"credits" integer DEFAULT 5 NOT NULL,
	"lastUpdated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "questionBank";--> statement-breakpoint
DROP TABLE "savedQuestions";