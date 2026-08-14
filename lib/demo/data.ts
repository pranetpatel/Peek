import { demoAvatarPath } from "./config";

/**
 * Fixed UUIDs so demo seeding is idempotent — re-entering demo mode updates the
 * same rows instead of piling up duplicates. The `de300000` prefix makes demo
 * rows obvious in a database client.
 */
export function demoId(n: number) {
  return `de300000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

export type DemoProfileSpec = {
  key: string;
  displayName: string;
  birthdate: string;
  gender: string;
  interestedIn: string[];
  bio: string;
  locationText: string;
  prompts: { question: string; answer: string }[];
  hobbyLabels: string[];
  valueLabels: string[];
};

export type DemoPersona = DemoProfileSpec & {
  /** Blurb shown on the demo launcher explaining what this account exercises. */
  tagline: string;
  /** false => bare profile that lands in the onboarding flow. */
  onboarded: boolean;
  photoCount: number;
};

// ---------------------------------------------------------------------------
// Personas — the accounts you can sign in as.
// ---------------------------------------------------------------------------

export const PERSONAS: DemoPersona[] = [
  {
    key: "ava",
    tagline: "Fully set up, with matches and chat history. Best starting point.",
    onboarded: true,
    photoCount: 3,
    displayName: "Ava Chen",
    birthdate: "1996-04-19",
    gender: "woman",
    interestedIn: ["man", "woman"],
    bio: "Ceramics studio on Saturdays, long trail runs on Sundays. I will talk your ear off about coffee.",
    locationText: "Austin, TX",
    prompts: [
      { question: "A hobby I'm obsessed with", answer: "Throwing bowls I never actually use." },
      { question: "The way to win me over", answer: "Bring me a pastry from a bakery I've never heard of." },
    ],
    hobbyLabels: ["Pottery", "Trail running", "Coffee brewing", "Fiction", "Live concerts", "Hiking"],
    valueLabels: ["Creative expression", "Health-conscious", "Personal growth", "Humor", "Open-mindedness"],
  },
  {
    key: "ben",
    tagline: "Onboarded but zero likes or matches — good for testing empty states.",
    onboarded: true,
    photoCount: 2,
    displayName: "Ben Ortiz",
    birthdate: "1993-08-02",
    gender: "man",
    interestedIn: ["woman"],
    bio: "Weeknight chess, weekend camping. Reformed spreadsheet enthusiast.",
    locationText: "Austin, TX",
    prompts: [{ question: "My ideal Sunday", answer: "Coffee, a chess puzzle, and a trail with no signal." }],
    hobbyLabels: ["Chess", "Camping", "Hiking", "Nonfiction", "Cooking"],
    valueLabels: ["Education", "Environmental sustainability", "Loyalty", "Work-life balance"],
  },
  {
    key: "newbie",
    tagline: "Brand-new empty account — drops you at step one of onboarding.",
    onboarded: false,
    photoCount: 0,
    displayName: "",
    birthdate: "2000-01-01",
    gender: "",
    interestedIn: [],
    bio: "",
    locationText: "",
    prompts: [],
    hobbyLabels: [],
    valueLabels: [],
  },
];

// ---------------------------------------------------------------------------
// Cast — the profiles that fill the browse queue and act as chat partners.
// ---------------------------------------------------------------------------

export const CAST: DemoProfileSpec[] = [
  {
    key: "maya",
    displayName: "Maya",
    birthdate: "1996-03-14",
    gender: "woman",
    interestedIn: ["man", "woman"],
    bio: "Trail runner and terrible-but-enthusiastic home baker.",
    locationText: "Austin, TX",
    prompts: [{ question: "My simple pleasures", answer: "A 6am run and an over-proofed sourdough." }],
    hobbyLabels: ["Hiking", "Trail running", "Baking", "Fiction", "Photography"],
    valueLabels: ["Personal growth", "Health-conscious", "Adventurous", "Humor"],
  },
  {
    key: "priya",
    displayName: "Priya",
    birthdate: "1994-07-22",
    gender: "woman",
    interestedIn: ["man", "woman"],
    bio: "Board game hoarder, currently learning Portuguese.",
    locationText: "Austin, TX",
    prompts: [{ question: "Two truths and a lie", answer: "I've read 200 books this year, I speak 4 languages, I can whistle." }],
    hobbyLabels: ["Board games", "Language learning", "Cooking", "Sci-fi & fantasy", "Coffee brewing"],
    valueLabels: ["Education", "Open-mindedness", "Career-driven", "Community-minded"],
  },
  {
    key: "sofia",
    displayName: "Sofia",
    birthdate: "1998-11-02",
    gender: "woman",
    interestedIn: ["man", "woman"],
    bio: "Weekend rock climber, weekday spreadsheet person.",
    locationText: "Austin, TX",
    prompts: [{ question: "Together we could", answer: "Get very bad at bouldering, together." }],
    hobbyLabels: ["Rock climbing", "Hiking", "Weightlifting", "Video games", "Trivia nights"],
    valueLabels: ["Goal-oriented", "Financially responsible", "Adventurous", "Independence"],
  },
  {
    key: "elena",
    displayName: "Elena",
    birthdate: "1995-05-30",
    gender: "woman",
    interestedIn: ["man", "woman"],
    bio: "Vinyl collector who will absolutely judge your record shelf.",
    locationText: "Austin, TX",
    prompts: [{ question: "The hill I will die on", answer: "Album order matters." }],
    hobbyLabels: ["Vinyl collecting", "Live concerts", "Playing guitar", "Craft beer", "Writing"],
    valueLabels: ["Creative expression", "Humor", "Loyalty", "Open-mindedness"],
  },
  {
    key: "nina",
    displayName: "Nina",
    birthdate: "1997-12-08",
    gender: "woman",
    interestedIn: ["woman", "man"],
    bio: "Pottery studio regular. Ask me how many mugs is too many mugs.",
    locationText: "Austin, TX",
    prompts: [{ question: "A hobby I'm obsessed with", answer: "Glaze chemistry. It's basically cooking for rocks." }],
    hobbyLabels: ["Pottery", "Painting", "Coffee brewing", "Fiction", "Yoga"],
    valueLabels: ["Creative expression", "Personal growth", "Spiritual", "Work-life balance"],
  },
  {
    key: "harper",
    displayName: "Harper",
    birthdate: "1995-02-11",
    gender: "woman",
    interestedIn: ["man"],
    bio: "Half marathon collector. Will absolutely make you a playlist.",
    locationText: "Austin, TX",
    prompts: [{ question: "My ideal Sunday", answer: "Long run, longer brunch." }],
    hobbyLabels: ["Running", "Trail running", "Live concerts", "Cooking", "Book clubs"],
    valueLabels: ["Health-conscious", "Humor", "Loyalty", "Personal growth"],
  },
  {
    key: "daniel",
    displayName: "Daniel",
    birthdate: "1993-09-18",
    gender: "man",
    interestedIn: ["woman"],
    bio: "Camping every chance I get. Ask me about my gear list.",
    locationText: "Austin, TX",
    prompts: [{ question: "Together we could", answer: "Drive three hours for a campsite with no cell service." }],
    hobbyLabels: ["Camping", "Hiking", "Trail running", "Photography", "Gardening"],
    valueLabels: ["Environmental sustainability", "Health-conscious", "Adventurous", "Personal growth"],
  },
  {
    key: "marcus",
    displayName: "Marcus",
    birthdate: "1991-01-09",
    gender: "man",
    interestedIn: ["woman"],
    bio: "Chess club dropout, still undefeated at trivia.",
    locationText: "Austin, TX",
    prompts: [{ question: "Two truths and a lie", answer: "I've never lost at trivia, I can't drive, I make great risotto." }],
    hobbyLabels: ["Chess", "Trivia nights", "Nonfiction", "Board games", "Cooking"],
    valueLabels: ["Education", "Goal-oriented", "Career-driven", "Financially responsible"],
  },
  {
    key: "theo",
    displayName: "Theo",
    birthdate: "1997-06-12",
    gender: "man",
    interestedIn: ["woman", "man"],
    bio: "Music production nerd. My apartment is 40% cables.",
    locationText: "Austin, TX",
    prompts: [{ question: "The way to win me over", answer: "Send me a song at 1am with no context." }],
    hobbyLabels: ["Music production", "Playing guitar", "Live concerts", "Video games", "Coffee brewing"],
    valueLabels: ["Creative expression", "Independence", "Humor", "Open-mindedness"],
  },
  {
    key: "jordan",
    displayName: "Jordan",
    birthdate: "1999-02-27",
    gender: "man",
    interestedIn: ["woman", "man"],
    bio: "Backpacked through 12 countries, still can't pack light.",
    locationText: "Austin, TX",
    prompts: [{ question: "My simple pleasures", answer: "Airport coffee at 5am before a long flight." }],
    hobbyLabels: ["Backpacking", "Road trips", "Language learning", "Cultural festivals", "Photography"],
    valueLabels: ["Adventurous", "Open-mindedness", "Personal growth", "Community-minded"],
  },
  {
    key: "alex",
    displayName: "Alex",
    birthdate: "1996-10-05",
    gender: "man",
    interestedIn: ["woman", "man"],
    bio: "Pottery on weekends, spreadsheets on weekdays.",
    locationText: "Austin, TX",
    prompts: [{ question: "A hobby I'm obsessed with", answer: "Making bowls nobody asked for." }],
    hobbyLabels: ["Pottery", "Painting", "Book clubs", "Yoga", "Hiking"],
    valueLabels: ["Creative expression", "Work-life balance", "Spiritual", "Family-focused"],
  },
  {
    key: "sam",
    displayName: "Sam",
    birthdate: "1992-05-21",
    gender: "man",
    interestedIn: ["woman", "man"],
    bio: "Cooks for eight, lives alone. Come hungry.",
    locationText: "Austin, TX",
    prompts: [{ question: "The way to win me over", answer: "Say yes to a restaurant you can't pronounce." }],
    hobbyLabels: ["Cooking", "Trying new restaurants", "Craft beer", "Cycling", "Fiction"],
    valueLabels: ["Family-focused", "Humor", "Community-minded", "Honesty"],
  },
];

// ---------------------------------------------------------------------------
// Scripted relationships, rebuilt from scratch on every demo reset.
// ---------------------------------------------------------------------------

/** Cast members who already liked a persona — liking them back matches instantly. */
export const INCOMING_LIKES: Record<string, string[]> = {
  ava: ["theo", "jordan", "nina", "sam"],
};

/** Pre-existing matches, with seeded chat history (oldest first). */
export const SCRIPTED_MATCHES: {
  personaKey: string;
  castKey: string;
  /** Minutes before "now" the match was created — controls list ordering. */
  matchedMinutesAgo: number;
  messages: { from: "persona" | "cast"; body: string; minutesAgo: number }[];
}[] = [
  {
    personaKey: "ava",
    castKey: "maya",
    matchedMinutesAgo: 60 * 26,
    messages: [
      { from: "cast", body: "Okay a fellow trail runner. What's your go-to route?", minutesAgo: 60 * 25 },
      { from: "persona", body: "Barton Creek, always. I pretend the hills aren't there.", minutesAgo: 60 * 24 },
      { from: "cast", body: "Respect. I'd bring you a scone but it'd be a bad one.", minutesAgo: 60 * 23 },
    ],
  },
  {
    personaKey: "ava",
    castKey: "priya",
    matchedMinutesAgo: 60 * 5,
    messages: [{ from: "cast", body: "We matched on coffee brewing so I have to ask: pour over or espresso?", minutesAgo: 45 }],
  },
  {
    personaKey: "ava",
    castKey: "elena",
    matchedMinutesAgo: 30,
    messages: [],
  },
];

export const ALL_DEMO_SPECS: DemoProfileSpec[] = [...PERSONAS, ...CAST];

const idByKey = new Map(ALL_DEMO_SPECS.map((spec, index) => [spec.key, demoId(index + 1)]));

export function demoProfileId(key: string): string {
  const id = idByKey.get(key);
  if (!id) throw new Error(`Unknown demo profile key: ${key}`);
  return id;
}

export const ALL_DEMO_IDS = ALL_DEMO_SPECS.map((spec) => demoProfileId(spec.key));

export function getPersona(key: string): DemoPersona | undefined {
  return PERSONAS.find((p) => p.key === key);
}

export function demoPhotoPaths(key: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => demoAvatarPath(`${key}-${i}`));
}
