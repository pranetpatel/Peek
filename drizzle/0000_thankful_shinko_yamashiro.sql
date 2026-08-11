CREATE TABLE "hobbies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"category" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "hobbies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "likes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"liker_id" uuid NOT NULL,
	"liked_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "likes_liker_liked_unique" UNIQUE("liker_id","liked_id")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_one_id" uuid NOT NULL,
	"profile_two_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "matches_profile_pair_unique" UNIQUE("profile_one_id","profile_two_id"),
	CONSTRAINT "matches_ordered_pair_check" CHECK ("matches"."profile_one_id" < "matches"."profile_two_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_hobbies" (
	"profile_id" uuid NOT NULL,
	"hobby_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_hobbies_profile_id_hobby_id_pk" PRIMARY KEY("profile_id","hobby_id")
);
--> statement-breakpoint
CREATE TABLE "profile_values" (
	"profile_id" uuid NOT NULL,
	"value_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_values_profile_id_value_id_pk" PRIMARY KEY("profile_id","value_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"birthdate" date NOT NULL,
	"gender" text NOT NULL,
	"interested_in" text[] NOT NULL,
	"bio" text,
	"prompts" jsonb,
	"location_text" text,
	"onboarding_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "values_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_liker_id_profiles_id_fk" FOREIGN KEY ("liker_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_liked_id_profiles_id_fk" FOREIGN KEY ("liked_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_profile_one_id_profiles_id_fk" FOREIGN KEY ("profile_one_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_profile_two_id_profiles_id_fk" FOREIGN KEY ("profile_two_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_hobbies" ADD CONSTRAINT "profile_hobbies_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_hobbies" ADD CONSTRAINT "profile_hobbies_hobby_id_hobbies_id_fk" FOREIGN KEY ("hobby_id") REFERENCES "public"."hobbies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_values" ADD CONSTRAINT "profile_values_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_values" ADD CONSTRAINT "profile_values_value_id_values_id_fk" FOREIGN KEY ("value_id") REFERENCES "public"."values"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "likes_liked_id_idx" ON "likes" USING btree ("liked_id");--> statement-breakpoint
CREATE INDEX "matches_profile_one_id_idx" ON "matches" USING btree ("profile_one_id");--> statement-breakpoint
CREATE INDEX "matches_profile_two_id_idx" ON "matches" USING btree ("profile_two_id");--> statement-breakpoint
CREATE INDEX "messages_match_id_created_at_idx" ON "messages" USING btree ("match_id","created_at");--> statement-breakpoint
CREATE INDEX "photos_profile_id_position_idx" ON "photos" USING btree ("profile_id","position");--> statement-breakpoint
CREATE INDEX "profile_hobbies_hobby_id_idx" ON "profile_hobbies" USING btree ("hobby_id");--> statement-breakpoint
CREATE INDEX "profile_values_value_id_idx" ON "profile_values" USING btree ("value_id");--> statement-breakpoint
CREATE INDEX "profiles_onboarding_completed_at_idx" ON "profiles" USING btree ("onboarding_completed_at");