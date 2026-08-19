const prisma = require('./db');

/**
 * Slug validation shared by every entity whose URL an admin can change.
 *
 * A slug becomes a public URL, so it is checked for shape, reserved words and
 * uniqueness — including uniqueness against the other entities that share the
 * same URL namespace, so /services/legal can never collide with a second row.
 */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Path segments the router owns.
const RESERVED = new Set([
  'api', 'admin', '_next', 'uploads', 'static', 'assets',
  'favicon.ico', 'robots.txt', 'sitemap.xml', 'new', 'edit', 'all',
]);

const normalise = (raw) =>
  String(raw ?? '').trim().replace(/^\/+|\/+$/g, '').toLowerCase();

const slugify = (raw) =>
  normalise(raw).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

/**
 * Validate a slug for one model.
 *
 * @param {object}  opts
 * @param {string}  opts.model  Prisma model name: 'service' | 'language' | 'city'
 * @param {string}  opts.raw    The submitted slug
 * @param {string}  [opts.id]   Row being updated, so it does not clash with itself
 * @param {string}  [opts.label] Human name of the entity, used in messages
 * @returns {Promise<{ ok: true, slug: string } | { ok: false, status: number, message: string }>}
 */
async function validateSlug({ model, raw, id, label = 'item' }) {
  const slug = normalise(raw);

  if (!slug) {
    return { ok: false, status: 400, message: 'Slug is required.' };
  }
  if (!SLUG_RE.test(slug)) {
    return {
      ok: false,
      status: 400,
      message:
        'Slug may contain lower-case letters, numbers and single hyphens only — for example "legal-translation".',
    };
  }
  if (RESERVED.has(slug)) {
    return { ok: false, status: 400, message: `"${slug}" is reserved and cannot be used as a slug.` };
  }

  // Clash with another row of the same model (slug or immutable key).
  const clash = await prisma[model].findFirst({
    where: {
      OR: [{ slug }, { key: slug }],
      ...(id ? { NOT: { id } } : {}),
    },
    select: { id: true, name: true, key: true, slug: true },
  });

  if (clash) {
    const which = clash.slug === slug ? 'slug' : 'key';
    return {
      ok: false,
      status: 409,
      message: `The slug "${slug}" is already used as the ${which} of "${clash.name}".`,
    };
  }

  void label;
  return { ok: true, slug };
}

module.exports = { validateSlug, slugify, normalise, SLUG_RE, RESERVED };
