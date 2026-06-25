import { describe, expect, it } from "vitest";
import type { PlaceFeature } from "../../src/domain/places";
import { filterVisiblePlaces, isVisiblePlace } from "../../src/domain/places";

function makePlace(id: string, visibility?: PlaceFeature["properties"]["visibility"]): PlaceFeature {
  return {
    type: "Feature",
    id,
    geometry: { type: "Point", coordinates: [36.1, 51.7] },
    properties: {
      id,
      ...(visibility ? { visibility } : {}),
      balloonContent: {
        name: `Место ${id}`,
        description: "Описание",
        address: "Курск",
      }
    }
  };
}

describe("place visibility", () => {
  it("treats a place without visibility settings as visible", () => {
    expect(isVisiblePlace(makePlace("public"))).toBe(true);
  });

  it("hides a place marked as not public", () => {
    expect(isVisiblePlace(makePlace("hidden", { public: false }))).toBe(false);
  });

  it("hides a link-only place", () => {
    expect(isVisiblePlace(makePlace("link-only", { linkOnly: true }))).toBe(false);
  });

  it("keeps visible places in order and excludes hidden places", () => {
    const places = [
      makePlace("first"),
      makePlace("hidden", { public: false }),
      makePlace("second"),
      makePlace("link-only", { linkOnly: true })
    ];

    expect(filterVisiblePlaces(places).map((place) => place.id)).toEqual(["first", "second"]);
  });
});
