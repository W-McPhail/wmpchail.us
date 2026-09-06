CREATE TABLE "images" (
	"id" varchar(24) PRIMARY KEY NOT NULL,
	"filename" text NOT NULL,
	"mime" varchar(64) NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"data" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
