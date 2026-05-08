/**
 * Directus Schema Migration — Tume ya Utumishi Serikalini CMS
 *
 * This script creates all content collections, fields, and roles
 * for the Civil Service Commission website.
 *
 * Run with: node migrations/001_initial_schema.js
 * Requires: DIRECTUS_URL and DIRECTUS_TOKEN environment variables
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || "admin123";

async function main() {
  console.log("Creating Directus schema...");

  // ========================================
  // 1. NEWS CATEGORIES
  // ========================================
  console.log("Creating news_categories collection...");
  await createCollection("news_categories", {
    icon: "category",
    sort_field: "id",
  });

  await createField("news_categories", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("news_categories", "name_sw", { type: "string", meta: { interface: "input", display: "raw", required: true, sort: 1 } });
  await createField("news_categories", "name_en", { type: "string", meta: { interface: "input", display: "raw", sort: 2 } });
  await createField("news_categories", "slug", { type: "string", meta: { interface: "input-slug", display: "raw", required: true, sort: 3, special: ["slug"] } });

  // ========================================
  // 2. INSTITUTIONS
  // ========================================
  console.log("Creating institutions collection...");
  await createCollection("institutions", { icon: "apartment", sort_field: "id" });

  await createField("institutions", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("institutions", "name_sw", { type: "string", meta: { interface: "input", required: true, sort: 1 } });
  await createField("institutions", "name_en", { type: "string", meta: { interface: "input", sort: 2 } });
  await createField("institutions", "slug", { type: "string", meta: { interface: "input-slug", required: true, sort: 3, special: ["slug"] } });

  // ========================================
  // 3. INTERVIEW TYPES
  // ========================================
  console.log("Creating interview_types collection...");
  await createCollection("interview_types", { icon: "clipboard", sort_field: "id" });

  await createField("interview_types", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("interview_types", "name_sw", { type: "string", meta: { interface: "input", required: true, sort: 1 } });
  await createField("interview_types", "name_en", { type: "string", meta: { interface: "input", sort: 2 } });

  // Seed interview types
  await seedInterviewTypes();

  // ========================================
  // 4. NEWS
  // ========================================
  console.log("Creating news collection...");
  await createCollection("news", { icon: "newspaper", sort_field: "date_published" });

  await createField("news", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("news", "status", { type: "string", meta: { interface: "select-dropdown", special: ["cast-cast"], options: { choices: [{ text: "Draft", value: "draft" }, { text: "Published", value: "published" }, { text: "Archived", value: "archived" }] } }, schema: { default_value: "draft" } });
  await createField("news", "title_sw", { type: "string", meta: { interface: "input", required: true, sort: 2 } });
  await createField("news", "title_en", { type: "string", meta: { interface: "input", sort: 3 } });
  await createField("news", "slug", { type: "string", meta: { interface: "input-slug", required: true, sort: 4, special: ["slug"] } });
  await createField("news", "excerpt_sw", { type: "text", meta: { interface: "input-textarea", sort: 5 } });
  await createField("news", "excerpt_en", { type: "text", meta: { interface: "input-textarea", sort: 6 } });
  await createField("news", "body_sw", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 7 } });
  await createField("news", "body_en", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 8 } });
  await createField("news", "category", { type: "integer", meta: { interface: "select-dropdown-m2o", special: ["m2o"], sort: 9 }, schema: { foreign_key_table: "news_categories", foreign_key_column: "id" } });
  await createField("news", "date_published", { type: "datetime", meta: { interface: "datetime", sort: 10, special: ["cast-cast"] } });
  await createField("news", "featured_image", { type: "uuid", meta: { interface: "file-image", special: ["file"], sort: 11 } });
  await createField("news", "pdf_document", { type: "uuid", meta: { interface: "file", special: ["file"], sort: 12 } });

  // ========================================
  // 5. VACANCIES
  // ========================================
  console.log("Creating vacancies collection...");
  await createCollection("vacancies", { icon: "work", sort_field: "date_posted" });

  await createField("vacancies", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("vacancies", "status", { type: "string", meta: { interface: "select-dropdown", special: ["cast-cast"], options: { choices: [{ text: "Draft", value: "draft" }, { text: "Published", value: "published" }, { text: "Closed", value: "closed" }] } }, schema: { default_value: "draft" } });
  await createField("vacancies", "title_sw", { type: "string", meta: { interface: "input", required: true, sort: 2 } });
  await createField("vacancies", "title_en", { type: "string", meta: { interface: "input", sort: 3 } });
  await createField("vacancies", "slug", { type: "string", meta: { interface: "input-slug", required: true, sort: 4, special: ["slug"] } });
  await createField("vacancies", "institution_sw", { type: "string", meta: { interface: "input", sort: 5 } });
  await createField("vacancies", "institution_en", { type: "string", meta: { interface: "input", sort: 6 } });
  await createField("vacancies", "description_sw", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 7 } });
  await createField("vacancies", "description_en", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 8 } });
  await createField("vacancies", "date_posted", { type: "datetime", meta: { interface: "datetime", special: ["cast-cast"], sort: 9 } });
  await createField("vacancies", "deadline_date", { type: "datetime", meta: { interface: "datetime", special: ["cast-cast"], sort: 10 } });
  await createField("vacancies", "pdf_document", { type: "uuid", meta: { interface: "file", special: ["file"], sort: 11 } });

  // ========================================
  // 6. INTERVIEWS
  // ========================================
  console.log("Creating interviews collection...");
  await createCollection("interviews", { icon: "people", sort_field: "date_posted" });

  await createField("interviews", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("interviews", "status", { type: "string", meta: { interface: "select-dropdown", special: ["cast-cast"], options: { choices: [{ text: "Draft", value: "draft" }, { text: "Published", value: "published" }] } }, schema: { default_value: "draft" } });
  await createField("interviews", "title_sw", { type: "string", meta: { interface: "input", required: true, sort: 2 } });
  await createField("interviews", "title_en", { type: "string", meta: { interface: "input", sort: 3 } });
  await createField("interviews", "slug", { type: "string", meta: { interface: "input-slug", required: true, sort: 4, special: ["slug"] } });
  await createField("interviews", "institution", { type: "integer", meta: { interface: "select-dropdown-m2o", special: ["m2o"], sort: 5 }, schema: { foreign_key_table: "institutions", foreign_key_column: "id" } });
  await createField("interviews", "interview_type", { type: "string", meta: { interface: "select-dropdown", special: ["cast-cast"], options: { choices: [{ text: "Written", value: "written" }, { text: "Face-to-Face", value: "face_to_face" }, { text: "Practical", value: "practical" }, { text: "Screening", value: "screening" }] }, sort: 6 } });
  await createField("interviews", "description_sw", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 7 } });
  await createField("interviews", "description_en", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 8 } });
  await createField("interviews", "date_posted", { type: "datetime", meta: { interface: "datetime", special: ["cast-cast"], sort: 9 } });
  await createField("interviews", "pdf_document", { type: "uuid", meta: { interface: "file", special: ["file"], sort: 10 } });

  // ========================================
  // 7. BOARD MEMBERS
  // ========================================
  console.log("Creating board_members collection...");
  await createCollection("board_members", { icon: "people_alt", sort_field: "sort_order" });

  await createField("board_members", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("board_members", "status", { type: "string", meta: { interface: "select-dropdown", special: ["cast-cast"], options: { choices: [{ text: "Draft", value: "draft" }, { text: "Published", value: "published" }, { text: "Archived", value: "archived" }] } }, schema: { default_value: "draft" } });
  await createField("board_members", "name", { type: "string", meta: { interface: "input", required: true, sort: 2 } });
  await createField("board_members", "title_role_sw", { type: "string", meta: { interface: "input", sort: 3 } });
  await createField("board_members", "title_role_en", { type: "string", meta: { interface: "input", sort: 4 } });
  await createField("board_members", "photo", { type: "uuid", meta: { interface: "file-image", special: ["file"], sort: 5 } });
  await createField("board_members", "bio_sw", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 6 } });
  await createField("board_members", "bio_en", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 7 } });
  await createField("board_members", "sort_order", { type: "integer", meta: { interface: "input", sort: 8 }, schema: { default_value: 0 } });

  // ========================================
  // 8. DEPARTMENTS
  // ========================================
  console.log("Creating departments collection...");
  await createCollection("departments", { icon: "business", sort_field: "sort_order" });

  await createField("departments", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("departments", "status", { type: "string", meta: { interface: "select-dropdown", special: ["cast-cast"], options: { choices: [{ text: "Draft", value: "draft" }, { text: "Published", value: "published" }, { text: "Archived", value: "archived" }] } }, schema: { default_value: "draft" } });
  await createField("departments", "name_sw", { type: "string", meta: { interface: "input", required: true, sort: 2 } });
  await createField("departments", "name_en", { type: "string", meta: { interface: "input", sort: 3 } });
  await createField("departments", "head_name", { type: "string", meta: { interface: "input", sort: 4 } });
  await createField("departments", "description_sw", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 5 } });
  await createField("departments", "description_en", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 6 } });
  await createField("departments", "image", { type: "uuid", meta: { interface: "file-image", special: ["file"], sort: 7 } });
  await createField("departments", "sort_order", { type: "integer", meta: { interface: "input", sort: 8 }, schema: { default_value: 0 } });

  // ========================================
  // 9. UNITS
  // ========================================
  console.log("Creating units collection...");
  await createCollection("units", { icon: "groups", sort_field: "sort_order" });

  await createField("units", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("units", "status", { type: "string", meta: { interface: "select-dropdown", special: ["cast-cast"], options: { choices: [{ text: "Draft", value: "draft" }, { text: "Published", value: "published" }, { text: "Archived", value: "archived" }] } }, schema: { default_value: "draft" } });
  await createField("units", "name_sw", { type: "string", meta: { interface: "input", required: true, sort: 2 } });
  await createField("units", "name_en", { type: "string", meta: { interface: "input", sort: 3 } });
  await createField("units", "department", { type: "integer", meta: { interface: "select-dropdown-m2o", special: ["m2o"], sort: 4 }, schema: { foreign_key_table: "departments", foreign_key_column: "id" } });
  await createField("units", "head_name", { type: "string", meta: { interface: "input", sort: 5 } });
  await createField("units", "description_sw", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 6 } });
  await createField("units", "description_en", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 7 } });
  await createField("units", "sort_order", { type: "integer", meta: { interface: "input", sort: 8 }, schema: { default_value: 0 } });

  // ========================================
  // 10. PAGES (About, Mission, etc.)
  // ========================================
  console.log("Creating pages collection...");
  await createCollection("pages", { icon: "article", sort_field: "id" });

  await createField("pages", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("pages", "status", { type: "string", meta: { interface: "select-dropdown", special: ["cast-cast"], options: { choices: [{ text: "Draft", value: "draft" }, { text: "Published", value: "published" }, { text: "Archived", value: "archived" }] } }, schema: { default_value: "draft" } });
  await createField("pages", "slug", { type: "string", meta: { interface: "input-slug", required: true, sort: 2, special: ["slug"] } });
  await createField("pages", "title_sw", { type: "string", meta: { interface: "input", required: true, sort: 3 } });
  await createField("pages", "title_en", { type: "string", meta: { interface: "input", sort: 4 } });
  await createField("pages", "body_sw", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 5 } });
  await createField("pages", "body_en", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 6 } });

  // ========================================
  // 11. HERO SLIDES
  // ========================================
  console.log("Creating hero_slides collection...");
  await createCollection("hero_slides", { icon: "slideshow", sort_field: "sort_order" });

  await createField("hero_slides", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("hero_slides", "status", { type: "string", meta: { interface: "select-dropdown", special: ["cast-cast"], options: { choices: [{ text: "Draft", value: "draft" }, { text: "Published", value: "published" }] } }, schema: { default_value: "draft" } });
  await createField("hero_slides", "title_sw", { type: "string", meta: { interface: "input", sort: 2 } });
  await createField("hero_slides", "title_en", { type: "string", meta: { interface: "input", sort: 3 } });
  await createField("hero_slides", "subtitle_sw", { type: "string", meta: { interface: "input", sort: 4 } });
  await createField("hero_slides", "subtitle_en", { type: "string", meta: { interface: "input", sort: 5 } });
  await createField("hero_slides", "image", { type: "uuid", meta: { interface: "file-image", special: ["file"], required: true, sort: 6 } });
  await createField("hero_slides", "link_url", { type: "string", meta: { interface: "input", sort: 7 } });
  await createField("hero_slides", "sort_order", { type: "integer", meta: { interface: "input", sort: 8 }, schema: { default_value: 0 } });
  await createField("hero_slides", "is_active", { type: "boolean", meta: { interface: "toggle", sort: 9 }, schema: { default_value: true } });

  // ========================================
  // 12. SERVICES
  // ========================================
  console.log("Creating services collection...");
  await createCollection("services", { icon: "medical_services", sort_field: "sort_order" });

  await createField("services", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("services", "status", { type: "string", meta: { interface: "select-dropdown", special: ["cast-cast"], options: { choices: [{ text: "Draft", value: "draft" }, { text: "Published", value: "published" }] } }, schema: { default_value: "draft" } });
  await createField("services", "name_sw", { type: "string", meta: { interface: "input", required: true, sort: 2 } });
  await createField("services", "name_en", { type: "string", meta: { interface: "input", sort: 3 } });
  await createField("services", "description_sw", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 4 } });
  await createField("services", "description_en", { type: "text", meta: { interface: "input-rich-text-html", special: ["cast-cast"], sort: 5 } });
  await createField("services", "document", { type: "uuid", meta: { interface: "file", special: ["file"], sort: 6 } });
  await createField("services", "sort_order", { type: "integer", meta: { interface: "input", sort: 7 }, schema: { default_value: 0 } });

  // ========================================
  // 13. CONTACT SUBMISSIONS
  // ========================================
  console.log("Creating contact_submissions collection...");
  await createCollection("contact_submissions", { icon: "mail", sort_field: "created_at" });

  await createField("contact_submissions", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("contact_submissions", "full_name", { type: "string", meta: { interface: "input", required: true, sort: 1 } });
  await createField("contact_submissions", "email", { type: "string", meta: { interface: "input", required: true, special: ["cast-cast"], sort: 2 } });
  await createField("contact_submissions", "subject", { type: "string", meta: { interface: "input", required: true, sort: 3 } });
  await createField("contact_submissions", "message", { type: "text", meta: { interface: "input-textarea", required: true, sort: 4 } });
  await createField("contact_submissions", "created_at", { type: "datetime", meta: { interface: "datetime", special: ["cast-cast", "date-created"], sort: 5, readonly: true } });
  await createField("contact_submissions", "is_read", { type: "boolean", meta: { interface: "toggle", sort: 6 }, schema: { default_value: false } });

  // ========================================
  // 14. SITE SETTINGS (Singleton)
  // ========================================
  console.log("Creating site_settings singleton...");
  await createCollection("site_settings", { icon: "settings", singleton: true });

  await createField("site_settings", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: false } });
  await createField("site_settings", "phone", { type: "string", meta: { interface: "input", sort: 1 } });
  await createField("site_settings", "email", { type: "string", meta: { interface: "input", sort: 2 } });
  await createField("site_settings", "address_sw", { type: "text", meta: { interface: "input-textarea", sort: 3 } });
  await createField("site_settings", "address_en", { type: "text", meta: { interface: "input-textarea", sort: 4 } });
  await createField("site_settings", "office_hours_sw", { type: "string", meta: { interface: "input", sort: 5 } });
  await createField("site_settings", "office_hours_en", { type: "string", meta: { interface: "input", sort: 6 } });
  await createField("site_settings", "facebook_url", { type: "string", meta: { interface: "input", sort: 7 } });
  await createField("site_settings", "instagram_url", { type: "string", meta: { interface: "input", sort: 8 } });
  await createField("site_settings", "youtube_url", { type: "string", meta: { interface: "input", sort: 9 } });
  await createField("site_settings", "zanajira_portal_url", { type: "string", meta: { interface: "input", sort: 10 }, schema: { default_value: "https://portal.zanajira.go.tz" } });
  await createField("site_settings", "ajira_portal_url", { type: "string", meta: { interface: "input", sort: 11 }, schema: { default_value: "https://ajira.go.tz" } });

  // ========================================
  // 15. LEGACY URLS (for WordPress redirect mapping)
  // ========================================
  console.log("Creating legacy_urls collection...");
  await createCollection("legacy_urls", { icon: "link", sort_field: "id" });

  await createField("legacy_urls", "id", { type: "integer", schema: { is_primary_key: true, has_auto_increment: true } });
  await createField("legacy_urls", "old_id", { type: "string", meta: { interface: "input", required: true, sort: 1 } });
  await createField("legacy_urls", "new_url", { type: "string", meta: { interface: "input", required: true, sort: 2 } });
  await createField("legacy_urls", "collection_name", { type: "string", meta: { interface: "select-dropdown", sort: 3, options: { choices: [{ text: "News", value: "news" }, { text: "Vacancy", value: "vacancies" }, { text: "Interview", value: "interviews" }, { text: "Page", value: "pages" }, { text: "PDF", value: "pdf" }] } } });

  // ========================================
  // 16. ROLES
  // ========================================
  console.log("Creating user roles...");
  await createRole("Editor", "Can create and publish content, upload files, view contact submissions");
  await createRole("Reviewer", "All Editor permissions plus ability to archive/unpublish content");

  console.log("\n✅ Schema migration complete!");
  console.log("Next steps:");
  console.log("  1. Start Directus: cd cms && npx directus start");
  console.log("  2. Log in as admin and configure the MinIO storage backend");
  console.log("  3. Run seed data: node cms/seed/seed-data.js");
}

// Helper functions

async function createCollection(collection: string, meta: Record<string, unknown>) {
  const response = await fetch(`${DIRECTUS_URL}/collections`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${DIRECTUS_TOKEN}` },
    body: JSON.stringify({ collection, meta }),
  });
  if (response.ok) {
    console.log(`  ✓ Collection "${collection}" created`);
  } else if (response.status === 409) {
    console.log(`  → Collection "${collection}" already exists, skipping`);
  } else {
    const error = await response.text();
    console.error(`  ✗ Failed to create "${collection}": ${response.status} ${error}`);
  }
}

async function createField(collection: string, field: string, def: Record<string, unknown>) {
  const body: Record<string, unknown> = {
    collection,
    field,
    type: def.type,
    meta: {
      ...def.meta,
      collection,
      field,
    },
  };
  if (def.schema) {
    body.schema = def.schema;
  }

  const response = await fetch(`${DIRECTUS_URL}/fields/${collection}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${DIRECTUS_TOKEN}` },
    body: JSON.stringify(body),
  });
  if (response.ok) {
    // Field created
  } else if (response.status === 409) {
    // Field already exists, skip
  } else {
    const error = await response.text();
    console.error(`    ✗ Field "${collection}.${field}": ${response.status} ${error}`);
  }
}

async function createRole(name: string, description: string) {
  const response = await fetch(`${DIRECTUS_URL}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${DIRECTUS_TOKEN}` },
    body: JSON.stringify({ name, description, enforce_tfa: false }),
  });
  if (response.ok) {
    console.log(`  ✓ Role "${name}" created`);
  } else if (response.status === 409) {
    console.log(`  → Role "${name}" already exists`);
  } else {
    const error = await response.text();
    console.error(`  ✗ Failed to create role "${name}": ${error}`);
  }
}

async function seedInterviewTypes() {
  const types = [
    { name_sw: "Andishi", name_en: "Written", id: 1 },
    { name_sw: "Ana kwa Ana", name_en: "Face-to-Face", id: 2 },
    { name_sw: "Vitendo", name_en: "Practical", id: 3 },
    { name_sw: "Uchunguzi", name_en: "Screening", id: 4 },
  ];
  for (const t of types) {
    await fetch(`${DIRECTUS_URL}/items/interview_types`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${DIRECTUS_TOKEN}` },
      body: JSON.stringify(t),
    });
  }
  console.log("  ✓ Interview types seeded");
}

main().catch(console.error);