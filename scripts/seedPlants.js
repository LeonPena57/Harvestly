import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFile(filename = ".env") {
  const envPath = path.resolve(__dirname, "..", filename);
  if (!fs.existsSync(envPath)) {
    throw new Error(`Unable to locate ${filename} next to the project root.`);
  }

  const fileContents = fs.readFileSync(envPath, "utf-8");
  for (const line of fileContents.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const delimiterIndex = line.indexOf("=");
    if (delimiterIndex === -1) continue;
    const key = line.slice(0, delimiterIndex).trim();
    const value = line.slice(delimiterIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function createSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase credentials. Provide VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment."
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const placeholderPlants = [
  {
    nickname: "Sunny",
    official_name: "Helianthus annuus",
    description: "Cheery sunflower thriving near the patio.",
    picture_url:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&w=800",
    sun_level: "direct sun",
    difficulty: "easy",
    water_amount: "Deep soak twice a week during bloom season.",
    notes: "Rotate the pot weekly to keep the stem straight.",
    season: "summer",
    soil_type: "loamy",
    life_expectation: "annual",
  },
  {
    nickname: "Fernanda",
    official_name: "Nephrolepis exaltata",
    description: "Boston fern brightening up the bathroom shelf.",
    picture_url:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&w=800&sat=-100",
    sun_level: "partial shade",
    difficulty: "moderate",
    water_amount: "Keep soil consistently moist; mist fronds daily.",
    notes: "Loves the humidity from showers.",
    season: "spring",
    soil_type: "peaty",
    life_expectation: "perennial",
  },
  {
    nickname: "Spice",
    official_name: "Ocimum basilicum",
    description: "Sweet basil used for weekly pasta nights.",
    picture_url:
      "https://images.unsplash.com/photo-1589308078054-8323d81f7472?auto=format&w=800",
    sun_level: "direct sun",
    difficulty: "easy",
    water_amount: "Light watering every other day in summer.",
    notes: "Pinch the tops to prevent flowering.",
    season: "summer",
    soil_type: "sandy",
    life_expectation: "annual",
  },
  {
    nickname: "Shade Queen",
    official_name: "Calathea makoyana",
    description: "Peacock plant with dramatic evening leaf movements.",
    picture_url:
      "https://images.unsplash.com/photo-1461750718961-95bba2c39c19?auto=format&w=800",
    sun_level: "shade",
    difficulty: "hard",
    water_amount: "Filtered water twice a week; never let soil dry out.",
    notes: "Sensitive to cold drafts; keep above 65°F.",
    season: "winter",
    soil_type: "peaty",
    life_expectation: "perennial",
  },
  {
    nickname: "Cacti Crew",
    official_name: "Echinopsis oxygona",
    description: "Cluster cactus with occasional nighttime blooms.",
    picture_url:
      "https://images.unsplash.com/photo-1470165473874-0122e4b6637d?auto=format&w=800",
    sun_level: "direct sun",
    difficulty: "easy",
    water_amount: "Sparse watering once every three weeks.",
    notes: "Move outdoors during heat waves for extra sunshine.",
    season: "spring",
    soil_type: "sandy",
    life_expectation: "perennial",
  },
];

async function seed() {
  loadEnvFile();
  const supabase = createSupabaseClient();

  const seedUserId = process.env.SEED_USER_ID || null;

  const plantsPayload = placeholderPlants.map((plant) => ({
    user_id: seedUserId,
    ...plant,
  }));

  const { data, error } = await supabase
    .from("plants")
    .insert(plantsPayload)
    .select();

  if (error) {
    console.error("Failed to insert placeholder plants:", error);
    process.exitCode = 1;
    return;
  }

  console.log(`Inserted ${data.length} placeholder plants.`);
}

seed().catch((error) => {
  console.error("Unexpected error while seeding plants:", error);
  process.exitCode = 1;
});
