import { NextResponse, type NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "szhms.com";

/** Subdomains that are never tenants. */
const RESERVED = new Set(["www", "app", "api", "admin", "static", "assets", "cdn"]);

/**
 * Rewrites `{tenant}.szhms.com/<path>` (and `{tenant}.localhost:3001/<path>` in
 * dev) to `/[tenantId]/<path>` so the App Router segment `app/[tenantId]/...`
 * handles every hospital. Requests to the apex host pass straight through.
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = (req.headers.get("host") ?? "").split(":")[0];

  let subdomain: string | null = null;
  if (host.endsWith(".localhost")) {
    subdomain = host.slice(0, -".localhost".length);
  } else if (host !== ROOT_DOMAIN && host.endsWith(`.${ROOT_DOMAIN}`)) {
    subdomain = host.slice(0, -`.${ROOT_DOMAIN}`.length);
  }

  if (!subdomain || RESERVED.has(subdomain)) {
    return NextResponse.next();
  }

  // Already rewritten / linked with an explicit tenant segment.
  if (url.pathname === `/${subdomain}` || url.pathname.startsWith(`/${subdomain}/`)) {
    return NextResponse.next();
  }

  const rewritten = url.clone();
  rewritten.pathname = `/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(rewritten);
}

export const config = {
  // Skip Next internals and any request with a file extension.
  matcher: ["/((?!_next/|favicon.ico|.*\\.[\\w]+$).*)"],
};
