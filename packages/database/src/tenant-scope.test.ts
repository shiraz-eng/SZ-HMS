import { describe, expect, it } from "vitest";
import { TenantContextError, scopeArgs } from "./tenant-scope";

const T = "tenant_a";

describe("scopeArgs", () => {
  it("injects tenantId into a bare findUnique where", () => {
    const out = scopeArgs("Patient", "findUnique", { where: { id: "p1" } }, T);
    expect(out.where).toEqual({ id: "p1", tenantId: T });
  });

  it("injects tenantId into findMany with no where", () => {
    const out = scopeArgs("Appointment", "findMany", {}, T);
    expect(out.where).toEqual({ tenantId: T });
  });

  it("sets data.tenantId on create", () => {
    const out = scopeArgs("Billing", "create", { data: { amountCents: 100 } }, T);
    expect(out.data).toEqual({ amountCents: 100, tenantId: T });
  });

  it("sets create.tenantId on upsert", () => {
    const out = scopeArgs(
      "MedicalRecord",
      "upsert",
      { where: { id: "m1" }, create: { plan: "x" }, update: {} },
      T,
    );
    expect(out.create).toEqual({ plan: "x", tenantId: T });
    expect(out.where).toEqual({ id: "m1", tenantId: T });
  });

  it("stamps every row of createMany", () => {
    const out = scopeArgs("Bed", "createMany", { data: [{ label: "A" }, { label: "B" }] }, T);
    expect(out.data).toEqual([
      { label: "A", tenantId: T },
      { label: "B", tenantId: T },
    ]);
  });

  it("rejects a cross-tenant filter", () => {
    expect(() =>
      scopeArgs("Patient", "findMany", { where: { tenantId: "tenant_b" } }, T),
    ).toThrow(TenantContextError);
  });

  it("allows a matching explicit tenantId", () => {
    const out = scopeArgs("Patient", "findMany", { where: { tenantId: T, active: true } }, T);
    expect(out.where).toEqual({ tenantId: T, active: true });
  });

  it("leaves non-scoped models untouched", () => {
    const out = scopeArgs("Tenant", "findUnique", { where: { slug: "mercy" } }, T);
    expect(out.where).toEqual({ slug: "mercy" });
  });
});
