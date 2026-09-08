import type { CSSProperties, ReactNode } from "react";

export interface TenantTheme {
  /** Brand colour hex from the DB, e.g. "#1D4ED8". */
  primaryHex: string;
  /** Optional secondary/CTA colour. */
  accentHex?: string;
  /** Foreground colour that sits on top of `primaryHex` (defaults to white). */
  primaryForegroundHex?: string;
  /** Optional corner radius override, e.g. "0.5rem" or "0px". */
  radius?: string;
}

/** "#1D4ED8" -> "29 78 216" (space-separated channels for `rgb(var(--x) / <alpha>)`). */
function hexToChannels(hex: string): string {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return "37 99 235"; // fall back to Cobalt Blue 600
  // eslint-disable-next-line no-bitwise
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/**
 * Wraps a tenant's subtree and overrides design tokens with per-hospital values.
 * `display: contents` keeps the wrapper layout-neutral, so it can sit directly
 * inside a Server Component layout without affecting the grid/flow.
 */
export function TenantThemeProvider({
  theme,
  children,
}: {
  theme: TenantTheme;
  children: ReactNode;
}) {
  const style: CSSProperties = {
    display: "contents",
    // Custom props are valid CSSProperties keys at runtime; cast for TS.
    ...({
      "--color-primary": hexToChannels(theme.primaryHex),
      ...(theme.accentHex ? { "--color-accent": hexToChannels(theme.accentHex) } : {}),
      ...(theme.primaryForegroundHex
        ? { "--color-primary-fg": hexToChannels(theme.primaryForegroundHex) }
        : {}),
      ...(theme.radius ? { "--radius": theme.radius } : {}),
    } as CSSProperties),
  };

  return <div style={style}>{children}</div>;
}
