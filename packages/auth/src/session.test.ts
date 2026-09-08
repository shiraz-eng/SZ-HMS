import { beforeAll, describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken, type SessionUser } from "./session";

const user: SessionUser = {
  userId: "u1",
  tenantId: "t1",
  tenantSlug: "demo",
  role: "DOCTOR",
  name: "Dr. Test",
  email: "doctor@demo.io",
};

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-at-least-16-chars-long";
});

describe("session tokens", () => {
  it("round-trips a valid session", async () => {
    const token = await createSessionToken(user);
    expect(await verifySessionToken(token)).toEqual(user);
  });

  it("returns null for undefined / empty", async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
  });

  it("returns null for a tampered token", async () => {
    const token = await createSessionToken(user);
    const tampered = token.slice(0, -3) + "aaa";
    expect(await verifySessionToken(tampered)).toBeNull();
  });

  it("returns null when signed with a different secret", async () => {
    const token = await createSessionToken(user);
    process.env.AUTH_SECRET = "a-completely-different-secret-value";
    expect(await verifySessionToken(token)).toBeNull();
    process.env.AUTH_SECRET = "test-secret-at-least-16-chars-long";
  });
});
