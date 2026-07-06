import { describe, expect, it } from "vitest";
import * as placeCategoryDomain from "../../src/domain/placeCategories";
import type { PlaceFeature } from "../../src/domain/places";

const places = [
  {
    type: "Feature",
    id: "chalet",
    geometry: { type: "Point", coordinates: [36.1, 51.7] },
    properties: {
      id: "chalet",
      categories: ["chalet"],
      balloonContent: { name: "Шале", description: "Домик", address: "Курский район" }
    }
  },
  {
    type: "Feature",
    id: "city",
    geometry: { type: "Point", coordinates: [36.2, 51.8] },
    properties: {
      id: "city",
      balloonContent: { name: "Городское место", description: "В центре", address: "Курск" }
    }
  }
] satisfies PlaceFeature[];

type CategoryDomain = {
  filterPlacesByCategory?: (places: PlaceFeature[], category: "chalet" | null) => PlaceFeature[];
  getAvailablePlaceCategories?: (places: PlaceFeature[]) => ReadonlyArray<{ slug: "chalet"; label: string }>;
  parsePlaceCategory?: (value: string | null) => "chalet" | null;
};

const categoryDomain = placeCategoryDomain as CategoryDomain;

describe("place categories", () => {
  it("filters places by category and keeps all places without an active category", () => {
    expect(typeof categoryDomain.filterPlacesByCategory).toBe("function");
    if (!categoryDomain.filterPlacesByCategory) return;

    expect(categoryDomain.filterPlacesByCategory(places, "chalet").map((place) => place.id)).toEqual(["chalet"]);
    expect(categoryDomain.filterPlacesByCategory(places, null)).toEqual(places);
  });

  it("returns only categories represented in the current map", () => {
    expect(typeof categoryDomain.getAvailablePlaceCategories).toBe("function");
    if (!categoryDomain.getAvailablePlaceCategories) return;

    expect(categoryDomain.getAvailablePlaceCategories(places)).toEqual([{ slug: "chalet", label: "🏡 Шале" }]);
    expect(categoryDomain.getAvailablePlaceCategories(places.slice(1))).toEqual([]);
  });

  it("parses only known URL category slugs", () => {
    expect(typeof categoryDomain.parsePlaceCategory).toBe("function");
    if (!categoryDomain.parsePlaceCategory) return;

    expect(categoryDomain.parsePlaceCategory("chalet")).toBe("chalet");
    expect(categoryDomain.parsePlaceCategory("unknown")).toBeNull();
    expect(categoryDomain.parsePlaceCategory(null)).toBeNull();
  });
});
