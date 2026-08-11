import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  integer,
  boolean,
  jsonb,
  primaryKey,
  index,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const profiles = pgTable(
  "profiles",
  {
    // Matches Supabase auth.users.id — no FK constraint since auth.users lives
    // in a different schema managed by Supabase.
    id: uuid("id").primaryKey(),
    displayName: text("display_name").notNull(),
    birthdate: date("birthdate").notNull(),
    gender: text("gender").notNull(),
    interestedIn: text("interested_in").array().notNull(),
    bio: text("bio"),
    // [{ question: string, answer: string }]
    prompts: jsonb("prompts").$type<{ question: string; answer: string }[]>(),
    locationText: text("location_text"),
    onboardingCompletedAt: timestamp("onboarding_completed_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("profiles_onboarding_completed_at_idx").on(table.onboardingCompletedAt)]
);

export const photos = pgTable(
  "photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    storagePath: text("storage_path").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("photos_profile_id_position_idx").on(table.profileId, table.position)]
);

export const hobbies = pgTable("hobbies", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  category: text("category").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const values = pgTable("values", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  label: text("label").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const profileHobbies = pgTable(
  "profile_hobbies",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    hobbyId: uuid("hobby_id")
      .notNull()
      .references(() => hobbies.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.profileId, table.hobbyId] }),
    index("profile_hobbies_hobby_id_idx").on(table.hobbyId),
  ]
);

export const profileValues = pgTable(
  "profile_values",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    valueId: uuid("value_id")
      .notNull()
      .references(() => values.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({ columns: [table.profileId, table.valueId] }),
    index("profile_values_value_id_idx").on(table.valueId),
  ]
);

export const likes = pgTable(
  "likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    likerId: uuid("liker_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    likedId: uuid("liked_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("likes_liker_liked_unique").on(table.likerId, table.likedId),
    // Supports the reverse-like lookup done when checking for a mutual match.
    index("likes_liked_id_idx").on(table.likedId),
  ]
);

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    profileOneId: uuid("profile_one_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    profileTwoId: uuid("profile_two_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("matches_profile_pair_unique").on(table.profileOneId, table.profileTwoId),
    // Application code always normalizes the pair (lower uuid first) before
    // insert; this constraint rejects anything that skips that normalization.
    check("matches_ordered_pair_check", sql`${table.profileOneId} < ${table.profileTwoId}`),
    index("matches_profile_one_id_idx").on(table.profileOneId),
    index("matches_profile_two_id_idx").on(table.profileTwoId),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("messages_match_id_created_at_idx").on(table.matchId, table.createdAt)]
);
