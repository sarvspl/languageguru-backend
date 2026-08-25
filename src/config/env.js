/**
 * Environment configuration — the single place that reads process.env.
 *
 * Every value here is REQUIRED and has no fallback. A missing or obviously
 * placeholder value stops the process at boot with a message naming exactly what
 * to fix, rather than letting the server start and fail later — or worse, start
 * and silently work off a default that leaks into production.
 */
require('dotenv').config();

const REQUIRED = {
  DATABASE_URL: 'PostgreSQL connection string, e.g. postgresql://user:pass@host:5432/dbname?schema=public',
  JWT_SECRET: 'Secret used to sign admin sessions. Generate with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64url\'))"',
  FRONTEND_URL: 'Public website origin, e.g. http://localhost:3000',
  ADMIN_URL: 'Admin panel origin, e.g. http://localhost:3001',
};

const OPTIONAL = {
  PORT: '5000',
  NODE_ENV: 'development',
  // Interface to bind. Behind a reverse proxy set HOST=127.0.0.1 so the port is
  // not reachable from the internet directly — otherwise every request that
  // skips nginx also skips HTTPS and the rate limits keyed on the real client IP.
  HOST: '0.0.0.0',
  // Number of reverse proxies in front of this server, passed to Express's
  // `trust proxy`. Behind one nginx that is 1; add one for each extra hop (a CDN
  // such as Cloudflare in front of nginx makes it 2). Left at 0 every request
  // appears to come from 127.0.0.1, so express-rate-limit throttles ALL clients
  // together — ten failed logins from anyone would lock out the whole panel.
  // Never set this higher than the real hop count: each trusted hop is one more
  // X-Forwarded-For entry a client can forge to fake its IP.
  TRUST_PROXY: '0',
};

// Values that mean "not configured yet" even though the variable is present.
const PLACEHOLDERS = [
  'CHANGE_ME',
  'changeme',
  'your-secret-here',
  // The secret that used to be hardcoded in the source is public knowledge.
  'languageguru_secret_key_2026_super_secure_jwt',
];

function fail(lines) {
  console.error('\n╔══════════════════════════════════════════════════════════════════╗');
  console.error('║  Configuration error — the server cannot start                    ║');
  console.error('╚══════════════════════════════════════════════════════════════════╝\n');
  lines.forEach((l) => console.error(l));
  console.error('\nCopy .env.example to .env and fill in the values above.\n');
  process.exit(1);
}

const problems = [];

for (const [key, hint] of Object.entries(REQUIRED)) {
  const raw = process.env[key];
  if (raw === undefined || String(raw).trim() === '') {
    problems.push(`  ✗ ${key} is not set.\n      ${hint}`);
    continue;
  }
  const value = String(raw).trim();
  if (PLACEHOLDERS.some((p) => value.includes(p))) {
    problems.push(`  ✗ ${key} still holds a placeholder or publicly-known value.\n      ${hint}`);
  }
}

// A short signing secret defeats the point of having one.
const secret = String(process.env.JWT_SECRET || '').trim();
if (secret && secret.length < 32) {
  problems.push(`  ✗ JWT_SECRET is only ${secret.length} characters. Use at least 32.\n      ${REQUIRED.JWT_SECRET}`);
}

const asOrigin = (key) => {
  const value = String(process.env[key] || '').trim().replace(/\/+$/, '');
  if (!value) return null;
  try {
    const url = new URL(value);
    // `new URL('localhost:3000')` parses in Node — "localhost:" is read as the
    // scheme — so the protocol has to be checked explicitly.
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('protocol');
    }
    if (!url.hostname) throw new Error('hostname');
    return value;
  } catch {
    problems.push(`  ✗ ${key} must be an absolute http(s) URL, e.g. http://localhost:3000 — got "${value}".`);
    return null;
  }
};

const FRONTEND_URL = asOrigin('FRONTEND_URL');
const ADMIN_URL = asOrigin('ADMIN_URL');

if (problems.length) fail(problems);

const NODE_ENV = String(process.env.NODE_ENV || OPTIONAL.NODE_ENV).trim();

// Extra origins are opt-in and comma-separated, so no host is ever trusted
// implicitly by living in the source.
const EXTRA_ORIGINS = String(process.env.EXTRA_CORS_ORIGINS || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const trustProxy = parseInt(process.env.TRUST_PROXY || OPTIONAL.TRUST_PROXY, 10);
if (Number.isNaN(trustProxy) || trustProxy < 0) {
  fail([`  ✗ TRUST_PROXY must be a non-negative whole number — got "${process.env.TRUST_PROXY}".
      ${OPTIONAL.TRUST_PROXY} means "no proxy"; 1 means "one nginx in front".`]);
}

const env = {
  NODE_ENV,
  isProduction: NODE_ENV === 'production',
  PORT: parseInt(process.env.PORT || OPTIONAL.PORT, 10),
  HOST: String(process.env.HOST || OPTIONAL.HOST).trim(),
  TRUST_PROXY: trustProxy,
  DATABASE_URL: String(process.env.DATABASE_URL).trim(),
  JWT_SECRET: secret,
  FRONTEND_URL,
  ADMIN_URL,
  ALLOWED_ORIGINS: Array.from(new Set([FRONTEND_URL, ADMIN_URL, ...EXTRA_ORIGINS])),
};

module.exports = env;
