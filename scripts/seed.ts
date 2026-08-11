import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "@/lib/db";
import { hobbies, values, profiles, profileHobbies, profileValues } from "@/lib/db/schema";

// Curated hobby taxonomy grouped by category. Slugs are used to look up ids
// when wiring up demo profiles below, so they must stay in sync with HOBBY_DATA.
const HOBBY_DATA: { category: string; items: string[] }[] = [
  { category: "Music", items: ["Live concerts", "Playing guitar", "Vinyl collecting", "Singing", "Music production", "Piano"] },
  { category: "Reading", items: ["Fiction", "Sci-fi & fantasy", "Nonfiction", "Poetry", "Book clubs", "Graphic novels"] },
  { category: "Outdoors", items: ["Hiking", "Camping", "Rock climbing", "Surfing", "Trail running", "Gardening"] },
  { category: "Fitness", items: ["Weightlifting", "Yoga", "Running", "Cycling", "Martial arts", "Pilates"] },
  { category: "Food & Drink", items: ["Cooking", "Baking", "Coffee brewing", "Wine tasting", "Trying new restaurants", "Craft beer"] },
  { category: "Creative", items: ["Painting", "Photography", "Writing", "Filmmaking", "Pottery", "Design"] },
  { category: "Games", items: ["Board games", "Video games", "Chess", "Trivia nights", "Card games"] },
  { category: "Travel", items: ["Backpacking", "Road trips", "Language learning", "Cultural festivals", "Scuba diving"] },
];

// Curated values taxonomy with optional short descriptions.
const VALUES_DATA: { label: string; description?: string }[] = [
  { label: "Goal-oriented", description: "Driven by ambition and long-term plans" },
  { label: "Education", description: "Lifelong learning matters deeply" },
  { label: "Family-focused", description: "Family is a top priority" },
  { label: "Adventurous", description: "Seeks new experiences and risk" },
  { label: "Financially responsible" },
  { label: "Spiritual", description: "Guided by faith or spiritual practice" },
  { label: "Community-minded", description: "Invested in local community and giving back" },
  { label: "Health-conscious" },
  { label: "Creative expression" },
  { label: "Environmental sustainability" },
  { label: "Honesty", description: "Directness and transparency above all" },
  { label: "Independence" },
  { label: "Loyalty" },
  { label: "Personal growth", description: "Actively working on self-improvement" },
  { label: "Career-driven" },
  { label: "Work-life balance" },
  { label: "Open-mindedness" },
  { label: "Humor", description: "Doesn't take life too seriously" },
];

// Demo profiles reference hobbies/values by label so overlap can be checked
// by hand during manual verification without cross-referencing ids.
const DEMO_PROFILES: {
  displayName: string;
  birthdate: string;
  gender: string;
  interestedIn: string[];
  bio: string;
  locationText: string;
  hobbyLabels: string[];
  valueLabels: string[];
}[] = [
  {
    displayName: "Maya",
    birthdate: "1996-03-14",
    gender: "woman",
    interestedIn: ["man"],
    bio: "Trail runner and terrible-but-enthusiastic home baker.",
    locationText: "Austin, TX",
    hobbyLabels: ["Hiking", "Trail running", "Baking", "Fiction", "Photography"],
    valueLabels: ["Personal growth", "Health-conscious", "Adventurous", "Humor"],
  },
  {
    displayName: "Priya",
    birthdate: "1994-07-22",
    gender: "woman",
    interestedIn: ["man"],
    bio: "Board game hoarder, currently learning Portuguese.",
    locationText: "Austin, TX",
    hobbyLabels: ["Board games", "Language learning", "Cooking", "Sci-fi & fantasy"],
    valueLabels: ["Education", "Open-mindedness", "Career-driven", "Community-minded"],
  },
  {
    displayName: "Sofia",
    birthdate: "1998-11-02",
    gender: "woman",
    interestedIn: ["man", "woman"],
    bio: "Weekend rock climber, weekday spreadsheet person.",
    locationText: "Austin, TX",
    hobbyLabels: ["Rock climbing", "Hiking", "Weightlifting", "Video games", "Trivia nights"],
    valueLabels: ["Goal-oriented", "Financially responsible", "Adventurous", "Independence"],
  },
  {
    displayName: "Elena",
    birthdate: "1995-05-30",
    gender: "woman",
    interestedIn: ["man"],
    bio: "Vinyl collector who will absolutely judge your record shelf.",
    locationText: "Austin, TX",
    hobbyLabels: ["Vinyl collecting", "Live concerts", "Playing guitar", "Craft beer", "Writing"],
    valueLabels: ["Creative expression", "Humor", "Loyalty", "Open-mindedness"],
  },
  {
    displayName: "Daniel",
    birthdate: "1993-09-18",
    gender: "man",
    interestedIn: ["woman"],
    bio: "Camping every chance I get. Ask me about my gear list.",
    locationText: "Austin, TX",
    hobbyLabels: ["Camping", "Hiking", "Trail running", "Photography", "Gardening"],
    valueLabels: ["Environmental sustainability", "Health-conscious", "Adventurous", "Personal growth"],
  },
  {
    displayName: "Marcus",
    birthdate: "1991-01-09",
    gender: "man",
    interestedIn: ["woman"],
    bio: "Chess club dropout, still undefeated at trivia.",
    locationText: "Austin, TX",
    hobbyLabels: ["Chess", "Trivia nights", "Nonfiction", "Board games", "Cooking"],
    valueLabels: ["Education", "Goal-oriented", "Career-driven", "Financially responsible"],
  },
  {
    displayName: "Theo",
    birthdate: "1997-06-12",
    gender: "man",
    interestedIn: ["woman", "man"],
    bio: "Music production nerd. My apartment is 40% cables.",
    locationText: "Austin, TX",
    hobbyLabels: ["Music production", "Playing guitar", "Live concerts", "Video games"],
    valueLabels: ["Creative expression", "Independence", "Humor", "Open-mindedness"],
  },
  {
    displayName: "Jordan",
    birthdate: "1999-02-27",
    gender: "man",
    interestedIn: ["woman"],
    bio: "Backpacked through 12 countries, still can't pack light.",
    locationText: "Austin, TX",
    hobbyLabels: ["Backpacking", "Road trips", "Language learning", "Cultural festivals", "Photography"],
    valueLabels: ["Adventurous", "Open-mindedness", "Personal growth", "Community-minded"],
  },
  {
    displayName: "Alex",
    birthdate: "1996-10-05",
    gender: "man",
    interestedIn: ["woman", "man"],
    bio: "Pottery on weekends, spreadsheets on weekdays.",
    locationText: "Austin, TX",
    hobbyLabels: ["Pottery", "Painting", "Book clubs", "Yoga"],
    valueLabels: ["Creative expression", "Work-life balance", "Spiritual", "Family-focused"],
  },
];

async function main() {
  console.log("Seeding hobbies...");
  const hobbyRows: { id: string; label: string }[] = [];
  for (const [categoryIndex, group] of HOBBY_DATA.entries()) {
    for (const [itemIndex, label] of group.items.entries()) {
      const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const [row] = await db
        .insert(hobbies)
        .values({ slug, label, category: group.category, sortOrder: categoryIndex * 100 + itemIndex })
        .onConflictDoUpdate({ target: hobbies.slug, set: { label, category: group.category } })
        .returning({ id: hobbies.id, label: hobbies.label });
      hobbyRows.push(row);
    }
  }

  console.log("Seeding values...");
  const valueRows: { id: string; label: string }[] = [];
  for (const [index, item] of VALUES_DATA.entries()) {
    const slug = item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const [row] = await db
      .insert(values)
      .values({ slug, label: item.label, description: item.description, sortOrder: index })
      .onConflictDoUpdate({ target: values.slug, set: { label: item.label, description: item.description } })
      .returning({ id: values.id, label: values.label });
    valueRows.push(row);
  }

  const hobbyIdByLabel = new Map(hobbyRows.map((h) => [h.label, h.id]));
  const valueIdByLabel = new Map(valueRows.map((v) => [v.label, v.id]));

  console.log("Seeding demo profiles...");
  for (const demo of DEMO_PROFILES) {
    const [profile] = await db
      .insert(profiles)
      .values({
        id: crypto.randomUUID(),
        displayName: demo.displayName,
        birthdate: demo.birthdate,
        gender: demo.gender,
        interestedIn: demo.interestedIn,
        bio: demo.bio,
        locationText: demo.locationText,
        onboardingCompletedAt: new Date(),
      })
      .returning({ id: profiles.id });

    const hobbyIds = demo.hobbyLabels.map((label) => hobbyIdByLabel.get(label)).filter((id): id is string => Boolean(id));
    const valueIds = demo.valueLabels.map((label) => valueIdByLabel.get(label)).filter((id): id is string => Boolean(id));

    if (hobbyIds.length > 0) {
      await db.insert(profileHobbies).values(hobbyIds.map((hobbyId) => ({ profileId: profile.id, hobbyId })));
    }
    if (valueIds.length > 0) {
      await db.insert(profileValues).values(valueIds.map((valueId) => ({ profileId: profile.id, valueId })));
    }
  }

  console.log(
    `Seeded ${hobbyRows.length} hobbies, ${valueRows.length} values, and ${DEMO_PROFILES.length} demo profiles.`
  );
  console.log("Note: demo profiles have no photos — they aren't real auth users, just browse-queue filler for testing overlap ranking.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
