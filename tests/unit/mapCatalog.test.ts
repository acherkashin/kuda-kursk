import { describe, expect, it } from "vitest";
import { findMapBySlug, mapCatalog } from "../../src/domain/mapCatalog";

describe("mapCatalog", () => {
  it("contains the three public maps and their data files", () => {
    expect(mapCatalog).toEqual([
      { slug: "main", title: "Куда в Курске", description: "Путеводитель для местных", logo: "/brand/kuda-v-kurske-logo-128.webp", dataPath: "/data/main-map.json" },
      { slug: "dozapravka", title: "Дозаправка", description: "Где выдохнуть и перезагрузиться", logo: "/place-thumbnails/9001-dozapravka.jpg", dataPath: "/data/dozapravka-objects.json" },
      { slug: "zapishu-zarisuyu", title: "Запишу, зарисую", description: "Места для вдохновения", logo: "/brand/zapishu-zarisuyu-logo.webp", dataPath: "/data/zapishu-zarisuyu-objects.json" }
    ]);
  });

  it("finds a known map by slug", () => {
    expect(findMapBySlug("dozapravka")).toEqual({
      slug: "dozapravka",
      title: "Дозаправка",
      description: "Где выдохнуть и перезагрузиться",
      logo: "/place-thumbnails/9001-dozapravka.jpg",
      dataPath: "/data/dozapravka-objects.json"
    });
  });

  it("returns undefined for an unknown slug", () => {
    expect(findMapBySlug("unknown")).toBeUndefined();
  });
});
