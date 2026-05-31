import { describe, expect, it } from "vitest";
import type { CommunityMap } from "../../src/domain/communityMaps";
import { resolveCommunityMap } from "../../src/domain/communityMaps";
import type { PlaceFeature } from "../../src/domain/places";

const places = [
  {
    type: "Feature",
    id: "public",
    geometry: { type: "Point", coordinates: [36.1, 51.7] },
    properties: {
      id: "public",
      balloonContent: { name: "Публичное", description: "A", address: "A", coordinates: "A" }
    }
  },
  {
    type: "Feature",
    id: "link-only",
    geometry: { type: "Point", coordinates: [36.2, 51.8] },
    properties: {
      id: "link-only",
      visibility: { public: false, linkOnly: true, communitySlugs: ["club"] },
      balloonContent: { name: "По ссылке", description: "B", address: "B", coordinates: "B" }
    }
  }
] satisfies PlaceFeature[];

const maps = [
  { slug: "club", title: "Клубная карта", placeIds: ["public"], linkOnlyPlaceIds: ["link-only"] }
] satisfies CommunityMap[];

describe("resolveCommunityMap", () => {
  it("returns public and link-only places for a known community map", () => {
    const resolved = resolveCommunityMap("club", maps, places);

    expect(resolved.status).toBe("found");
    expect(resolved.status === "found" ? resolved.places.map((place) => place.id) : []).toEqual(["public", "link-only"]);
    expect(resolved.status === "found" ? resolved.linkOnlyCount : 0).toBe(1);
  });

  it("returns fallback state for an unknown slug", () => {
    expect(resolveCommunityMap("missing", maps, places)).toEqual({ status: "not-found", slug: "missing" });
  });
});
