/**
 * Seed Data Script — Tume ya Utumishi Serikalini CMS
 *
 * Populates the CMS with initial content for development and testing.
 * Run AFTER the migration script.
 *
 * Usage: DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=xxx node seed/seed-data.js
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || "";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
};

async function main() {
  console.log("Seeding CMS data...\n");

  // ========================================
  // 1. SITE SETTINGS
  // ========================================
  console.log("Creating site settings...");
  await upsert("site_settings", {
    id: 1,
    phone: "+255-663-101012",
    email: "info@zanajira.go.tz",
    address_sw: "Tume ya Utumishi Serikalini, Zanzibar",
    address_en: "Civil Service Commission, Zanzibar",
    office_hours_sw: "Jumatatu - Ijumaa: 07:30 - 15:30",
    office_hours_en: "Monday - Friday: 07:30 - 15:30",
    facebook_url: "https://facebook.com/zanajira",
    instagram_url: "https://instagram.com/zanajira",
    youtube_url: "https://youtube.com/@zanajira",
    zanajira_portal_url: "https://portal.zanajira.go.tz",
    ajira_portal_url: "https://ajira.go.tz",
  });

  // ========================================
  // 2. PAGES (About Us, etc.)
  // ========================================
  console.log("Creating pages...");
  await createItem("pages", {
    slug: "introduction",
    status: "published",
    title_sw: "Utangulizi",
    title_en: "Introduction",
    body_sw: "<p>Tume ya Utumishi Serikalini ni taasisi huru iliyoanzishwa chini ya Sheria ya Tume ya Utumishi Serikalini Na. 14 ya 1986 na Katiba ya Zanzibar ya 1984. Tume inajumuisha Mwenyekiti, Naibu Mwenyekiti, na Wanachama watano wote waliochaguliwa na Rais wa Zanzibar.</p>",
    body_en: "<p>The Civil Service Commission is an independent institution established under the Civil Service Commission Act No. 14 of 1986 and the Zanzibar Constitution of 1984. The Commission comprises a Chairman, Vice Chairman, and five Members, all appointed by the President of Zanzibar.</p>",
  });

  await createItem("pages", {
    slug: "mission-vision",
    status: "published",
    title_sw: "Dira na Dhamira",
    title_en: "Mission & Vision",
    body_sw: "<p><strong>Dira:</strong> Kuwa tume inayofanya kazi kwa ufanisi na uwazi katika utumishi wa umma.</p><p><strong>Dhamira:</strong> Kuhakikisha uteuzi, maendeleo, na nidhamu ya watumishi wa serikali kwa mujibu wa sheria na kanuni.</p>",
    body_en: "<p><strong>Vision:</strong> To be an efficient and transparent commission in public service.</p><p><strong>Mission:</strong> To ensure the appointment, development, and discipline of civil servants in accordance with laws and regulations.</p>",
  });

  await createItem("pages", {
    slug: "core-functions",
    status: "published",
    title_sw: "Kazi Msingi",
    title_en: "Core Functions",
    body_sw: "<p>Kazi msingi za Tume ya Utumishi Serikalini ni pamoja na:</p><ul><li>Kusimamia nidhamu ya watumishi wa serikali</li><li>Kuthibitisha uteuzi wa watumishi</li><li>Kuongeza muda wa utumishi</li><li>Kusimamiaustaafu na kuendeleza watumishi</li><li>Kushughulikia rufaa za watumishi</li></ul>",
    body_en: "<p>The core functions of the Civil Service Commission include:</p><ul><li>Managing civil servant discipline</li><li>Confirming servant appointments</li><li>Increasing service time</li><li>Overseeing retirement and promotion</li><li>Handling civil servant appeals</li></ul>",
  });

  // ========================================
  // 3. NEWS CATEGORIES
  // ========================================
  console.log("Creating news categories...");
  await createItem("news_categories", { name_sw: "Matangazo", name_en: "Announcements", slug: "announcements" });
  await createItem("news_categories", { name_sw: "Matokeo", name_en: "Results", slug: "results" });
  await createItem("news_categories", { name_sw: "Ushauri", name_en: "Advisory", slug: "advisory" });

  // ========================================
  // 4. INSTITUTIONS
  // ========================================
  console.log("Creating institutions...");
  await createItem("institutions", { name_sw: "Ofisi ya Mhasibu Mkuu", name_en: "Office of the Accountant General", slug: "accountant-general" });
  await createItem("institutions", { name_sw: "Wizara ya Kilimo", name_en: "Ministry of Agriculture", slug: "ministry-agriculture" });
  await createItem("institutions", { name_sw: "Tume ya Ardhi", name_en: "Land Commission", slug: "land-commission" });
  await createItem("institutions", { name_sw: "Benki ya Tanzania", name_en: "Bank of Tanzania", slug: "bank-tanzania" });
  await createItem("institutions", { name_sw: "Ofisi ya Mkuu wa Hazina", name_en: "Treasury Registrar Office", slug: "treasury-registrar" });
  await createItem("institutions", { name_sw: "Wizara ya Utalii na Mambo ya Kale", name_en: "Ministry of Tourism and Antiquities", slug: "ministry-tourism" });
  await createItem("institutions", { name_sw: "Wizara ya Uchumi wa Bluu na Uvuvi", name_en: "Ministry of Blue Economy and Fisheries", slug: "ministry-blue-economy" });
  await createItem("institutions", { name_sw: "Wizara ya Maji, Nishati na Madini", name_en: "Ministry of Water, Energy and Minerals", slug: "ministry-water-energy" });

  // ========================================
  // 5. HERO SLIDES
  // ========================================
  console.log("Creating hero slides...");
  await createItem("hero_slides", {
    status: "published",
    title_sw: "Karibu kwenye Tovuti ya Tume ya Utumishi Serikalini",
    title_en: "Welcome to the Civil Service Commission Website",
    subtitle_sw: "Tunahakikisha uteuzi na maendeleo ya watumishi wa serikali",
    subtitle_en: "Ensuring the appointment and development of civil servants",
    image: null,
    link_url: null,
    sort_order: 1,
    is_active: true,
  });

  // ========================================
  // 6. SERVICES
  // ========================================
  console.log("Creating services...");
  await createItem("services", {
    status: "published",
    name_sw: "Uteuzi wa Watumishi",
    name_en: "Civil Servant Appointment",
    description_sw: "Tume husimamia uteuzi wa watumishi wa serikali kwa mujibu wa sheria na kanuni zinazohusika.",
    description_en: "The Commission oversees the appointment of civil servants in accordance with relevant laws and regulations.",
    sort_order: 1,
  });
  await createItem("services", {
    status: "published",
    name_sw: "Nidhamu ya Watumishi",
    name_en: "Civil Servant Discipline",
    description_sw: "Tume inashughulikia masuala ya nidhamu ya watumishi wa serikali kwa kufuata taratibu za kisheria.",
    description_en: "The Commission handles disciplinary matters for civil servants following legal procedures.",
    sort_order: 2,
  });
  await createItem("services", {
    status: "published",
    name_sw: "Ustaafu na Kuendelea",
    name_en: "Retirement and Promotion",
    description_sw: "Tume inasimamia ustaafu na kuendelea kwa watumishi wa serikali.",
    description_en: "The Commission oversees retirement and promotion of civil servants.",
    sort_order: 3,
  });
  await createItem("services", {
    status: "published",
    name_sw: "Rufaa za Watumishi",
    name_en: "Civil Servant Appeals",
    description_sw: "Watumishi wa serikali wanaweza kuleta rufaa kwenye Tume kuhusu masuala ya utumishi.",
    description_en: "Civil servants can bring appeals to the Commission regarding service matters.",
    sort_order: 4,
  });

  console.log("\n✅ Seed data complete!");
}

async function upsert(collection: string, data: Record<string, unknown>) {
  const response = await fetch(`${DIRECTUS_URL}/items/${collection}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (response.ok) {
    console.log(`  ✓ ${collection} seeded`);
  } else if (response.status === 409) {
    console.log(`  → ${collection} already exists, updating...`);
    // Try to update
    await fetch(`${DIRECTUS_URL}/items/${collection}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
    });
  } else {
    const error = await response.text();
    console.error(`  ✗ Failed to seed ${collection}: ${response.status} ${error}`);
  }
}

async function createItem(collection: string, data: Record<string, unknown>) {
  const response = await fetch(`${DIRECTUS_URL}/items/${collection}`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.text();
    console.error(`  ✗ ${collection}: ${response.status} ${error}`);
  }
}

main().catch(console.error);