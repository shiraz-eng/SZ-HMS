import { describe, expect, it } from "vitest";
import { isValidSlug, normalizeSlug } from "./slug";

describe("normalizeSlug", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(normalizeSlug("Mercy Clinic")).toBe("mercy-clinic");
  });
  it("strips leading/trailing separators and symbols", () => {
    expect(normalizeSlug("  --St. Luke's!!  ")).toBe("st-luke-s");
  });
  it("collapses runs of non-alphanumerics", () => {
    expect(normalizeSlug("a___b   c")).toBe("a-b-c");
  });
  it("caps length at 32", () => {
    expect(normalizeSlug("x".repeat(50))).toHaveLength(32);
  });
});

describe("isValidSlug", () => {
  it("accepts a normal slug", () => {
    expect(isValidSlug("mercy-clinic")).toBe(true);
  });
  it("rejects reserved subdomains", () => {
    expect(isValidSlug("api")).toBe(false);
    expect(isValidSlug("www")).toBe(false);
  });
  it("rejects too-short or edge-hyphen slugs", () => {
    expect(isValidSlug("a")).toBe(false);
    expect(isValidSlug("-abc")).toBe(false);
    expect(isValidSlug("abc-")).toBe(false);
  });
});
