// Create or update an admin user. Usage:
//   npm run seed:admin -- --email admin@tume.go.tz --password "S3cret!" --name "Admin"
//   npm run seed:admin   (uses defaults for local dev — change in production)
import argon2 from "argon2";
import { prisma } from "../src/lib/db";

async function main() {
  const args = process.argv.slice(2);
  const get = (k: string, d: string) => {
    const i = args.indexOf(`--${k}`);
    return i >= 0 && args[i + 1] ? args[i + 1] : d;
  };

  const email = get("email", "admin@tume.go.tz").toLowerCase();
  const password = get("password", "ChangeMe!2026");
  const name = get("name", "Site Administrator");

  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const user = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash, name },
    create: { email, passwordHash, name },
  });

  console.log(`✓ Admin user saved: id=${user.id} email=${user.email} name=${user.name}`);
  if (password === "ChangeMe!2026") {
    console.warn("⚠ Using default password — change it before going to production.");
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});