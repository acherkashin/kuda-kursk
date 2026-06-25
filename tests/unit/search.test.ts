import { describe, expect, it } from "vitest";
import type { PlaceFeature } from "../../src/domain/places";
import { searchPlaces } from "../../src/domain/search";

const places = [
  {
    type: "Feature",
    id: "one",
    geometry: { type: "Point", coordinates: [36.1, 51.7] },
    properties: {
      id: "one",
      links: [{ label: "Telegram афиша", url: "https://t.me/example", kind: "telegram" }],
      balloonContent: {
        name: "Площадка на Боевке",
        description: "Спортивная зона",
        address: "Парк Боева дача",
      }
    }
  },
  {
    type: "Feature",
    id: "two",
    geometry: { type: "Point", coordinates: [36.2, 51.8] },
    properties: {
      id: "two",
      balloonContent: {
        name: "Дозаправка",
        description: "Городское место",
        address: "Центр",
      }
    }
  }
] satisfies PlaceFeature[];

describe("searchPlaces", () => {
  it("normalizes Russian text and searches name, description, address and link labels", () => {
    expect(searchPlaces(places, "боевке").map((place) => place.id)).toEqual(["one"]);
    expect(searchPlaces(places, "спортивная").map((place) => place.id)).toEqual(["one"]);
    expect(searchPlaces(places, "telegram").map((place) => place.id)).toEqual(["one"]);
    expect(searchPlaces(places, "дозаправка").map((place) => place.id)).toEqual(["two"]);
  });

  it("returns all places for an empty query", () => {
    expect(searchPlaces(places, "   ")).toHaveLength(2);
  });

  it("keeps search behavior stable for a 500-place publication set", () => {
    const fallback = places[0];

    if (!fallback) {
      throw new Error("Expected at least one fixture place");
    }

    const largeSet: PlaceFeature[] = Array.from({ length: 500 }, (_, index) => {
      const base = places[index % places.length] ?? fallback;

      return {
        type: "Feature",
        id: `place-${index}`,
        geometry: base.geometry,
        properties: {
          ...base.properties,
          id: `place-${index}`,
          balloonContent: {
            ...base.properties.balloonContent,
            name: index === 377 ? "Особая спортивная точка" : `Место ${index}`
          }
        }
      };
    });

    expect(searchPlaces(largeSet, "особая спортивная")).toHaveLength(1);
  });

  it("does not search unsupported editorial metadata left in imported properties", () => {
    const base = places[0];

    if (!base) {
      throw new Error("Expected at least one fixture place");
    }

    const placeWithFutureMetadata = {
      ...base,
      properties: {
        ...base.properties,
        futureTag: "секретный редакционный тег"
      }
    } satisfies PlaceFeature;

    expect(searchPlaces([placeWithFutureMetadata], "секретный")).toEqual([]);
  });
});
