import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@szhms/auth/session";

async function signOut(tenantId: string, origin: string) {
  (await cookies()).delete(SESSION_COOKIE);
  return NextResponse.redirect(new URL(`/${tenantId}/login`, origin));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  const { tenantId } = await params;
  return signOut(tenantId, new URL(req.url).origin);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenantId: string }> },
) {
  const { tenantId } = await params;
  return signOut(tenantId, new URL(req.url).origin);
}
