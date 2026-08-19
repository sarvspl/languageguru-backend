/**
 * ADMIN SEED — seeds the admin user and nothing else.
 *
 * Catalog data (languages, cities, services, industries) lives in seedCatalog.ts.
 * Page and section content lives in seedContent.ts.
 * `npm run seed:all` runs all three in the correct order.
 *
 * ── Configuration ──────────────────────────────────────────────────────────
 * Credentials come from .env only. Nothing is defaulted and nothing is
 * generated — a seed that invents credentials is a seed that ships known
 * credentials.
 *
 *   ADMIN_USERNAME   required
 *   ADMIN_PASSWORD   required — min 12 chars, with upper case, lower case and a digit
 *   ADMIN_NAME       optional display name, defaults to the username
 *   ADMIN_RESET      set to true to overwrite an EXISTING account's password
 *
 * ── Usage ──────────────────────────────────────────────────────────────────
 *   npm run seed:admin
 *       Creates the account if it does not exist. An existing account is never
 *       modified, so this is safe to re-run against a live database.
 *
 *   ADMIN_RESET=true npm run seed:admin
 *       Applies ADMIN_PASSWORD to the existing account. This also stamps
 *       passwordChangedAt, which invalidates every JWT issued before now — so
 *       every dashboard session, on every device, is signed out.
 */
// Load .env explicitly rather than relying on Prisma doing it as a side effect.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

/** Mirrors the policy enforced by PUT /api/v1/settings/change-password. */
function checkPolicy(pw: string): string | null {
  if (pw.length < 12) return 'must be at least 12 characters';
  if (!/[a-z]/.test(pw)) return 'must contain a lower-case letter';
  if (!/[A-Z]/.test(pw)) return 'must contain an upper-case letter';
  if (!/[0-9]/.test(pw)) return 'must contain a number';
  return null;
}

function missing(name: string, extra?: string) {
  console.error(`\n❌ ${name} is not set.`);
  console.error('   Add it to languageguru-backend/.env — see .env.example.');
  if (extra) console.error(`   ${extra}`);
  console.error('');
  process.exit(1);
}

async function main() {
  console.log('🔐 Seeding admin user…');

  const username = String(process.env.ADMIN_USERNAME || '').trim();
  const password = process.env.ADMIN_PASSWORD;
  const name = String(process.env.ADMIN_NAME || '').trim() || username;
  const reset = String(process.env.ADMIN_RESET || '').toLowerCase() === 'true';

  if (!username) missing('ADMIN_USERNAME');
  if (!password) {
    missing(
      'ADMIN_PASSWORD',
      'Generate one with:  node -e "console.log(require(\'crypto\').randomBytes(12).toString(\'base64url\'))"'
    );
  }

  const problem = checkPolicy(password as string);
  if (problem) {
    console.error(`\n❌ ADMIN_PASSWORD ${problem}. Nothing was changed.\n`);
    process.exit(1);
  }

  const existing = await prisma.adminUser.findUnique({ where: { username } });

  if (!existing) {
    const passwordHash = await bcrypt.hash(password as string, BCRYPT_ROUNDS);
    await prisma.adminUser.create({
      data: { username, passwordHash, name, role: 'SUPER_ADMIN', passwordChangedAt: new Date() },
    });
    console.log(`   ✅ created admin user "${username}"`);
    console.log('      Password read from ADMIN_PASSWORD — not printed.');
    return;
  }

  if (reset) {
    const passwordHash = await bcrypt.hash(password as string, BCRYPT_ROUNDS);
    await prisma.adminUser.update({
      where: { username },
      data: { passwordHash, name, passwordChangedAt: new Date() },
    });
    console.log(`   ✅ reset the password for "${username}"`);
    console.log('      Password read from ADMIN_PASSWORD — not printed.');
    console.log('   ↻ Every existing dashboard session has been signed out.');
    return;
  }

  console.log(`   ↳ admin user "${username}" already exists — left untouched.`);
  console.log('      To apply the password from .env:  ADMIN_RESET=true npm run seed:admin');
}

main()
  .catch((e) => {
    console.error('❌ Admin seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
