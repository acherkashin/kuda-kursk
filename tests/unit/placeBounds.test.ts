import { describe, expect, it } from "vitest";
import { calculatePlaceBounds } from "../../src/components/map/placeBounds";
import type { PlaceFeature } from "../../src/domain/places";

function makePlace(id: string, coordinates: [number, number]): PlaceFeature {
  return {
    type: "Feature",
    id,
    geometry: { type: "Point", coordinates },
    properties: {
      id,
      balloonContent: { name: id, description: id, address: id }
    }
  };
}

describe("calculatePlaceBounds", () => {
  it("returns null for an empty place set", () => {
    expect(calculatePlaceBounds([])).toBeNull();
  });

  it("uses the same coordinate for a single place", () => {
    const place = makePlace("one", [36.2, 51.7]);

    expect(calculatePlaceBounds([place])).toEqual([
      [36.2, 51.7],
      [36.2, 51.7]
    ]);
  });

  it("calculates southwest and northeast corners for multiple places", () => {
    const places = [
      makePlace("west", [35.06, 51.74]),
      makePlace("north", [36.34, 52.06]),
      makePlace("south", [36.41, 51.24])
    ];

    expect(calculatePlaceBounds(places)).toEqual([
      [35.06, 51.24],
      [36.41, 52.06]
    ]);
  });
});
