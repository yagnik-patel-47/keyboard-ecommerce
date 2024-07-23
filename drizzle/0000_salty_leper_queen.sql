DO $$ BEGIN
 CREATE TYPE "public"."aspect" AS ENUM('square', 'vertical', 'horizontal');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('draft', 'active', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."provider" AS ENUM('github');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"description" text,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "order_product" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"product_id" varchar(100) NOT NULL,
	"quantity" integer NOT NULL,
	"order_id" varchar(100) NOT NULL,
	"customer_name" varchar(50),
	"customer_email" varchar(50) NOT NULL,
	"shipping_address" json DEFAULT '{"city":null,"country":null,"line1":null,"line2":null,"postal_code":null,"state":null}'::json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "orders" (
	"stripe_order_id" varchar(100) PRIMARY KEY NOT NULL,
	"stripe_customer_id" varchar(100),
	"total_price" integer NOT NULL,
	"timestamp" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_images" (
	"cloudinary_id" text PRIMARY KEY NOT NULL,
	"product_id" varchar(30),
	"aspect" "aspect" DEFAULT 'square',
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_variants" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"product_id" varchar(30) NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(16) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"stock" integer NOT NULL,
	"stripe_product_id" varchar(30),
	"stripe_price_id" varchar(30),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "product_variants_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(256) NOT NULL,
	"description" text,
	"specifications" text,
	"additional_details" text,
	"status" "status" DEFAULT 'draft',
	"category_id" varchar(30),
	"subcategory_id" varchar(30),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "subcategories" (
	"id" varchar(30) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"slug" varchar(256) NOT NULL,
	"description" text,
	"category_id" varchar(30) NOT NULL,
	CONSTRAINT "subcategories_name_unique" UNIQUE("name"),
	CONSTRAINT "subcategories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text NOT NULL,
	"provider" "provider" NOT NULL,
	"provider_id" text NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"stripe_customer_id" text,
	"is_admin" boolean DEFAULT false,
	CONSTRAINT "user_provider_provider_id_pk" PRIMARY KEY("provider","provider_id"),
	CONSTRAINT "user_id_unique" UNIQUE("id"),
	CONSTRAINT "user_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_product" ADD CONSTRAINT "order_product_product_id_product_variants_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product_variants"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "order_product" ADD CONSTRAINT "order_product_order_id_orders_stripe_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("stripe_order_id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_subcategory_id_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."subcategories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "subcategories" ADD CONSTRAINT "subcategories_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "subcategories_category_id_idx" ON "subcategories" USING btree ("category_id");