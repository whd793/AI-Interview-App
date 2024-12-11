CREATE TABLE IF NOT EXISTS "questionBank" (
	"id" serial PRIMARY KEY NOT NULL,
	"questionId" varchar NOT NULL,
	"question" text NOT NULL,
	"category" varchar NOT NULL,
	"difficulty" varchar NOT NULL,
	"roleCategory" varchar NOT NULL,
	"experienceLevel" varchar NOT NULL,
	"commonFor" text NOT NULL,
	"sampleAnswer" text NOT NULL,
	"tips" text NOT NULL,
	"popularity" integer NOT NULL,
	"language" varchar DEFAULT 'en' NOT NULL,
	"createdAt" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "savedQuestions" (
	"id" serial PRIMARY KEY NOT NULL,
	"questionId" integer NOT NULL,
	"userEmail" varchar NOT NULL,
	"createdAt" varchar NOT NULL
);
