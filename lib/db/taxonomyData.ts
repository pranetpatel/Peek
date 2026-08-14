// Canonical hobby/value taxonomy. Shared by the CLI seed script
// (scripts/seed.ts) and demo mode's on-demand seeder (lib/demo/seed.ts) so the
// two can never drift — demo profiles reference these labels directly.

export const HOBBY_DATA: { category: string; items: string[] }[] = [
  { category: "Music", items: ["Live concerts", "Playing guitar", "Vinyl collecting", "Singing", "Music production", "Piano"] },
  { category: "Reading", items: ["Fiction", "Sci-fi & fantasy", "Nonfiction", "Poetry", "Book clubs", "Graphic novels"] },
  { category: "Outdoors", items: ["Hiking", "Camping", "Rock climbing", "Surfing", "Trail running", "Gardening"] },
  { category: "Fitness", items: ["Weightlifting", "Yoga", "Running", "Cycling", "Martial arts", "Pilates"] },
  { category: "Food & Drink", items: ["Cooking", "Baking", "Coffee brewing", "Wine tasting", "Trying new restaurants", "Craft beer"] },
  { category: "Creative", items: ["Painting", "Photography", "Writing", "Filmmaking", "Pottery", "Design"] },
  { category: "Games", items: ["Board games", "Video games", "Chess", "Trivia nights", "Card games"] },
  { category: "Travel", items: ["Backpacking", "Road trips", "Language learning", "Cultural festivals", "Scuba diving"] },
];

export const VALUES_DATA: { label: string; description?: string }[] = [
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

export function taxonomySlug(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
