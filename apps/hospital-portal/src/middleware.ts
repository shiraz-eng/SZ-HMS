import { NextResponse, type NextRequest } from "next/server";
import { ROLE_HOME, SESSION_COOKIE, verifySessionToken } from "@szhms/auth/session";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "szhms.com";
const RESERVED = new Set(["www", "app", "api", "admin", "static", "assets", "cdn"]);

/** Portal segments that require an authenticated session of the matching role. */
const GUARDED: Record<string, keyof typeof ROLE_HOME> = {
  doctor: "DOCTOR",
  patient: "PATIENT",
  reception: "RECEPTIONIST",
  admin: "ADMIN",
};

function resolveSubdomain(host: string): string | null {
  const h = host.split(":")[0];
  if (h.endsWith(".localhost")) return h.slice(0, -".localhost".length);
  if (h !== ROOT_DOMAIN && h.endsWith(`.${ROOT_DOMAIN}`)) {
    return h.slice(0, -`.${ROOT_DOMAIN}`.length);
  }
  return null;
}

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const sub = resolveSubdomain(req.headers.get("host") ?? "");

  // 1. Rewrite {tenant}.host/<path> -> /<tenant>/<path>
  let pathname = url.pathname;
  let needsRewrite = false;
  if (sub && !RESERVED.has(sub) && pathname !== `/${sub}` && !pathname.startsWith(`/${sub}/`)) {
    pathname = `/${sub}${pathname}`;
    needsRewrite = true;
  }

  // 2. Auth guard on /<tenant>/<portal>/...
  const segments = pathname.split("/").filter(Boolean); // [tenant, portal, ...]
  const tenantSlug = segments[0];
  const portal = segments[1];

  if (tenantSlug && portal && portal in GUARDED) {
    const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    const loginUrl = new URL(`/${tenantSlug}/login`, req.url);

    if (!session || session.tenantSlug !== tenantSlug) {
      return NextResponse.redirect(loginUrl);
    }
    if (session.role !== GUARDED[portal]) {
      return NextResponse.redirect(new URL(`/${tenantSlug}/${ROLE_HOME[session.role]}`, req.url));
    }
  }

  if (needsRewrite) {
    const rewritten = url.clone();
    rewritten.pathname = pathname;
    return NextResponse.rewrite(rewritten);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|.*\\.[\\w]+$).*)"],
};
