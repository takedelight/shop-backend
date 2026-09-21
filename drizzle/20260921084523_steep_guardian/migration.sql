CREATE TABLE "categories" (
	"id" varchar PRIMARY KEY,
	"name" varchar NOT NULL,
	"icon" varchar NOT NULL,
	"slug" varchar,
	"is_active" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
