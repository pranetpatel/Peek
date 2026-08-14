import { config } from "dotenv";
config({ path: ".env.local" });

import { resetDemoData } from "@/lib/demo/seed";
import { ALL_DEMO_IDS } from "@/lib/demo/data";

// Same reset the /demo panel button runs, for when you'd rather not open the UI.
async function main() {
  console.log("Resetting demo data...");
  await resetDemoData();
  console.log(`Seeded ${ALL_DEMO_IDS.length} demo profiles with scripted likes, matches and messages.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
