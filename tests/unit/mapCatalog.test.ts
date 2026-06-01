import { describe, expect, it } from "vitest";
import { findMapBySlug, mapCatalog } from "../../src/domain/mapCatalog";

describe("mapCatalog", () => {
  it("contains the three public maps and their data files", () => {
    expect(mapCatalog).toEqual([
      { slug: "main", title: "Куда в Курске", dataPath: "/data/main-map.json" },
      { slug: "dozapravka", title: "Дозаправка", dataPath: "/data/dozapravka-objects.json" },
      { slug: "zapishu-zarisuyu", title: "Запишу, зарисую", dataPath: "/data/zapishu-zarisuyu-objects.json" }
    ]);
  });

  it("finds a known map by slug", () => {
    expect(findMapBySlug("dozapravka")).toEqual({
      slug: "dozapravka",
      title: "Дозаправка",
      dataPath: "/data/dozapravka-objects.json"
    });
  });

  it("returns undefined for an unknown slug", () => {
    expect(findMapBySlug("unknown")).toBeUndefined();
  });
});
