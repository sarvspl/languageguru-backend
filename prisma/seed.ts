/**
 * ADMIN SEED — seeds the admin user and nothing else.
 *
 * Catalog data (languages, cities, services, industries) lives in seedCatalog.ts.
 * Page and section content lives in seedContent.ts.
 * `npm run seed:all` runs all three in the correct order.
 *
 * ── Usage ──────────────────────────────────────────────────────────────────
 *   npm run seed:admin
 *       Creates the admin user if it does not exist. If it already exists,
 *       nothing is touched and nothing is printed but a note.
 *
 *   ADMIN_USERNAME=owner ADMIN_PASSWORD='Str0ngPassphrase!' npm run seed:admin
 *       Creates that user with that password.
 *
 *   ADMIN_RESET=true ADMIN_PASSWORD='Str0ngPassphrase!' npm run seed:admin
 *       Resets the existing admin's password. This is deliberately opt-in:
 *       without ADMIN_RESET an existing account is never overwritten, so the
 *       seed can be re-run safely on a live database.
 *
 *   ADMIN_RESET=true npm run seed:admin
 *       Resets the password to a freshly generated one and prints it once.
 *
 * A reset also stamps passwordChangedAt, which invalidates every JWT issued
 * before it — so any existing dashboard session is logged out immediately.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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

/** A readable, policy-compliant password. */
function generatePassword(): string {
  const words = ['amber', 'harbour', 'lantern', 'meadow', 'quartz', 'thistle', 'velvet', 'willow', 'cobalt', 'juniper'];
  const pick = () => words[crypto.randomInt(words.length)];
  const cap = (w: string) => w[0].toUpperCase() + w.slice(1);
  return `${cap(pick())}-${pick()}-${crypto.randomInt(1000, 9999)}`;
}

function banner(lines: string[]) {
  const width = Math.max(...lines.map((l) => l.length)) + 2;
  console.log('   ┌' + '─'.repeat(width) + '┐');
  lines.forEach((l) => console.log('   │ ' + l.padEnd(width - 1) + '│'));
  console.log('   └' + '─'.repeat(width) + '┘');
}

async function main() {
  console.log('🔐 Seeding admin user…');

  const username = (process.env.ADMIN_USERNAME || 'admin').trim();
  const name = process.env.ADMIN_NAME || 'Super Admin';
  const reset = String(process.env.ADMIN_RESET || '').toLowerCase() === 'true';
  const supplied = process.env.ADMIN_PASSWORD;

  if (supplied) {
    const problem = checkPolicy(supplied);
    if (problem) {
      console.error(`❌ ADMIN_PASSWORD ${problem}. Nothing was changed.`);
      process.exit(1);
    }
  }

  const existing = await prisma.adminUser.findUnique({ where: { username } });

  // ── create ───────────────────────────────────────────────────────────────
  if (!existing) {
    const password = supplied || generatePassword();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await prisma.adminUser.create({
      data: { username, passwordHash, name, role: 'SUPER_ADMIN', passwordChangedAt: new Date() },
    });

    console.log(`   ✅ created admin user "${username}"`);
    banner([`Username:  ${username}`, `Password:  ${password}`]);
    if (!supplied) {
      console.log('   ⚠️  This password was generated and is shown only once. Change it after logging in,');
      console.log('      or set ADMIN_PASSWORD and re-seed.');
    }
    return;
  }

  // ── reset ────────────────────────────────────────────────────────────────
  if (reset) {
    const password = supplied || generatePassword();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await prisma.adminUser.update({
      where: { username },
      // passwordChangedAt invalidates every token issued before now, so all
      // existing dashboard sessions are signed out.
      data: { passwordHash, name, passwordChangedAt: new Date() },
    });

    console.log(`   ✅ reset the password for "${username}"`);
    banner([`Username:  ${username}`, `Password:  ${password}`]);
    console.log('   ↻ All existing dashboard sessions have been signed out.');
    return;
  }

  // ── leave alone ──────────────────────────────────────────────────────────
  console.log(`   ↳ admin user "${username}" already exists — left untouched.`);
  console.log('      To set a new password:  ADMIN_RESET=true ADMIN_PASSWORD=\'YourPassphrase1\' npm run seed:admin');
  console.log('      To let one be generated: ADMIN_RESET=true npm run seed:admin');
}

main()
  .catch((e) => {
    console.error('❌ Admin seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
