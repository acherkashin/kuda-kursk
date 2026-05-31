import { describe, expect, it } from "vitest";
import type { PlaceFeature } from "../../src/domain/places";
import { filterPlaces } from "../../src/domain/filterPlaces";

const places = [
  {
    type: "Feature",
    id: "sport-tourist",
    geometry: { type: "Point", coordinates: [36.1, 51.7] },
    properties: {
      id: "sport-tourist",
      categories: ["sport"],
      collections: ["tourist"],
      balloonContent: { name: "Спорт", description: "A", address: "A", coordinates: "A" }
    }
  },
  {
    type: "Feature",
    id: "restaurant-nastoyki",
    geometry: { type: "Point", coordinates: [36.2, 51.8] },
    properties: {
      id: "restaurant-nastoyki",
      categories: ["restaurants"],
      collections: ["nastoyki"],
      balloonContent: { name: "Бар", description: "B", address: "B", coordinates: "B" }
    }
  },
  {
    type: "Feature",
    id: "sport-nastoyki",
    geometry: { type: "Point", coordinates: [36.3, 51.9] },
    properties: {
      id: "sport-nastoyki",
      categories: ["sport", "restaurants"],
      collections: ["nastoyki"],
      balloonContent: { name: "Двор", description: "C", address: "C", coordinates: "C" }
    }
  }
] satisfies PlaceFeature[];

describe("filterPlaces", () => {
  it("combines selected values as OR inside filter type", () => {
    expect(filterPlaces(places, { categoryIds: ["sport", "restaurants"], collectionIds: [] })).toHaveLength(3);
  });

  it("combines categories and collections as AND between filter types", () => {
    expect(filterPlaces(places, { categoryIds: ["sport"], collectionIds: ["nastoyki"] }).map((place) => place.id)).toEqual([
      "sport-nastoyki"
    ]);
  });
});
