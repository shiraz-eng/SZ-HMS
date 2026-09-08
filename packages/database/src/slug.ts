/** Tenant subdomain helpers — no imports, safe to unit-test in isolation. */

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,30}[a-z0-9])?$/;

export const RESERVED_SLUGS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "static",
  "assets",
  "cdn",
  "mail",
]);

export function normalizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

export function isValidSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && !RESERVED_SLUGS.has(slug);
}
