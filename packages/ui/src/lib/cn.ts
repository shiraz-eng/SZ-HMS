/**
 * Tiny classlist joiner. No dependency on `clsx`/`tailwind-merge` so the design
 * system stays zero-install; swap in `tailwind-merge` later if class conflicts
 * become a problem.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
