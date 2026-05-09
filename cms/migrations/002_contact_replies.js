/**
 * Directus Migration — Add Reply Fields
 *
 * Adds reply fields to contact_submissions for admin replies.
 * Email sending is handled by the Next.js API route at /api/contact/reply.
 *
 * Run with: DIRECTUS_URL=http://localhost:8055 DIRECTUS_TOKEN=<token> node cms/migrations/002_contact_replies.js
 */

const DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || "admin123";

const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${DIRECTUS_TOKEN}`,
};

async function main() {
  console.log("Adding reply fields to contact_submissions...\n");

  await createField("contact_submissions", "status", {
    type: "string",
    meta: {
      interface: "select-dropdown",
      special: ["cast-cast"],
      options: {
        choices: [
          { text: "New", value: "new" },
          { text: "Replied", value: "replied" },
          { text: "Closed", value: "closed" },
        ],
      },
      sort: 7,
    },
    schema: { default_value: "new" },
  });

  await createField("contact_submissions", "reply_message", {
    type: "text",
    meta: {
      interface: "input-textarea",
      sort: 8,
      note: "Admin reply to the submitter. Use the /api/contact/reply endpoint to send via email.",
    },
  });

  await createField("contact_submissions", "reply_sent_at", {
    type: "dateTime",
    meta: {
      interface: "datetime",
      special: ["cast-cast"],
      readonly: true,
      sort: 9,
      note: "Auto-set when the reply email is sent.",
    },
  });

  console.log("\n✅ Migration complete!");
  console.log("Admins can now reply to contact submissions from Directus.");
  console.log("To send a reply email, POST to /api/contact/reply with {id, reply_message}.");
}

async function createField(collection, field, def) {
  const body = {
    collection,
    field,
    type: def.type,
    meta: { ...def.meta, collection, field },
  };
  if (def.schema) body.schema = def.schema;

  const response = await fetch(`${DIRECTUS_URL}/fields/${collection}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (response.ok) {
    console.log(`  ✓ Field "${collection}.${field}" created`);
  } else if (response.status === 409) {
    console.log(`  → Field "${collection}.${field}" already exists, skipping`);
  } else {
    const error = await response.text();
    console.error(`  ✗ Field "${collection}.${field}": ${response.status} ${error}`);
  }
}

main().catch(console.error);