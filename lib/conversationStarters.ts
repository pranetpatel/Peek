export type StarterCategory = "connection" | "getToKnow" | "goDeeper";

export type StarterOption = {
  id: string;
  category: StarterCategory;
  text: string;
};

type SharedAttribute = { slug: string; label: string };

const HOBBY_TEMPLATES: ((label: string) => string)[] = [
  (label) => `You're both into ${label} — how'd you get into it?`,
  (label) => `What's your favorite ${label} memory?`,
];

const VALUE_TEMPLATES: ((label: string) => string)[] = [
  (label) => `You both said ${label} matters to you — what does that look like day-to-day?`,
];

const FALLBACK_CONNECTION = "What's something you're really into lately that most people don't know about?";

const GET_TO_KNOW: string[] = [
  "What do you do outside of school or work?",
  "What's something you wish people knew about you?",
  "What signs should I look for to know if you're not doing okay?",
  "What's on your bucket list?",
  "What's your love language?",
  "Oh my — what was your first impression of me, if you had one?",
  "What are 3 things you want to do before you die, and why?",
  "What's something you've always wanted to try but haven't?",
  "What's a day you'd like to relive?",
  "What's one thing I don't know about you yet?",
  "What are you most thankful for right now?",
  "What memory fills you with gratitude?",
  "How would you describe me to a friend?",
  "What's a smell that instantly takes you back to a memory?",
  "What scent do you associate with home?",
  "What's your signature scent — perfume, cologne, or otherwise?",
  "Do you have a favorite smell that most people would find weird?",
];

const GO_DEEPER: string[] = [
  "Where do you want to live when you're older?",
  "What are your goals for the next 6 months, 1 year, 5 years, 10 years?",
  "What's the most important thing you've ever learned?",
  "What's something you've struggled with in the past but managed to overcome?",
  "What's your stance on nature vs. nurture?",
  "What's something you believe deeply that you feel most people don't get or understand?",
  "Do you believe in fate, or is it all random luck?",
  "How would you know if you liked someone? Loved someone?",
  "How do you know you trust someone?",
  "What do you think I'm afraid to admit about myself?",
  "How do you show someone you care about them once you're actually with them?",
  "What do you need from a partner when you're stressed or having a bad day?",
  "How do you like to handle disagreements in a relationship?",
  "What does being a good partner look like to you day-to-day?",
  "How much space do you need in a relationship versus togetherness?",
  "What's something a past partner did that made you feel truly loved?",
  "How do you typically communicate when something's bothering you?",
  "What would make you feel secure in a relationship?",
];

function buildId(category: StarterCategory, index: number) {
  return `${category}-${index}`;
}

/**
 * Mixes generic questions with ones tied to whatever the two matched
 * profiles actually share (via hobby/value tag overlap), so "connection"
 * prompts stay attribute-aware without hand-authoring one question per tag.
 */
export function buildStarterOptions(shared: {
  sharedHobbies: SharedAttribute[];
  sharedValues: SharedAttribute[];
}): StarterOption[] {
  const connectionTexts: string[] = [];

  // Values read as more substantive than hobbies, so prefer them when both exist.
  if (shared.sharedValues.length > 0) {
    const value = shared.sharedValues[0];
    connectionTexts.push(...VALUE_TEMPLATES.map((template) => template(value.label)));
  }
  if (shared.sharedHobbies.length > 0) {
    const hobby = shared.sharedHobbies[0];
    connectionTexts.push(...HOBBY_TEMPLATES.map((template) => template(hobby.label)));
  }
  if (connectionTexts.length === 0) {
    connectionTexts.push(FALLBACK_CONNECTION);
  }

  return [
    ...connectionTexts.map((text, i) => ({ id: buildId("connection", i), category: "connection" as const, text })),
    ...GET_TO_KNOW.map((text, i) => ({ id: buildId("getToKnow", i), category: "getToKnow" as const, text })),
    ...GO_DEEPER.map((text, i) => ({ id: buildId("goDeeper", i), category: "goDeeper" as const, text })),
  ];
}
