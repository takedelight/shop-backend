CREATE TYPE "auth_provider" AS ENUM('google', 'local');--> statement-breakpoint
CREATE TYPE "user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY,
	"username" varchar NOT NULL UNIQUE,
	"avatar_key" varchar,
	"email" varchar NOT NULL UNIQUE,
	"password" varchar,
	"role" "user_role" DEFAULT 'user'::"user_role" NOT NULL,
	"provider" "auth_provider" DEFAULT 'local'::"auth_provider" NOT NULL,
	"provider_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "provider_provider_id_idx" ON "users" ("provider","provider_id");