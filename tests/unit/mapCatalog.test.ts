import { describe, expect, it } from "vitest";
import { findMapBySlug, mapCatalog } from "../../src/domain/mapCatalog";

describe("mapCatalog", () => {
  it("finds a map by trimmed slug", () => {
    const firstMap = mapCatalog[0];

    expect(firstMap).toBeDefined();
    expect(findMapBySlug(` ${firstMap.slug} `)).toBe(firstMap);
  });

  it("returns undefined for an unknown slug", () => {
    expect(findMapBySlug("unknown")).toBeUndefined();
    expect(findMapBySlug("   ")).toBeUndefined();
    expect(findMapBySlug(undefined)).toBeUndefined();
  });
});
