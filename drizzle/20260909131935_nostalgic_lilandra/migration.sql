CREATE TABLE "products" (
	"id" varchar PRIMARY KEY,
	"name" varchar NOT NULL,
	"description" varchar,
	"price" numeric(10,2) NOT NULL,
	"image_keys" varchar[] NOT NULL,
	"in_stock" boolean NOT NULL,
	"stock_quantity" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
