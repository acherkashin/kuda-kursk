import { describe, expect, it } from "vitest";
import type { PlaceFeature } from "../../src/domain/places";
import { createPlaceFeatureCollection } from "../../src/components/map/placeSource";

function makePlace(id: string, image?: string, thumbnail?: string): PlaceFeature {
  return {
    type: "Feature",
    id,
    geometry: { type: "Point", coordinates: [36.1, 51.7] },
    properties: {
      id,
      balloonContent: {
        name: `Место ${id}`,
        description: "Описание",
        address: "Курск",
        ...(image ? { image } : {}),
        ...(thumbnail ? { thumbnail } : {})
      }
    }
  };
}

describe("createPlaceFeatureCollection", () => {
  it("uses thumbnail as marker image and falls back to image", () => {
    const collection = createPlaceFeatureCollection([
      makePlace("thumb", "/images/full.jpg", "/images/thumb.jpg"),
      makePlace("image", "/images/only-full.jpg")
    ]);

    expect(collection.features[0]?.properties).toMatchObject({
      markerImage: "/images/thumb.jpg",
      markerImageId: "place-marker-thumb"
    });
    expect(collection.features[1]?.properties).toMatchObject({
      markerImage: "/images/only-full.jpg",
      markerImageId: "place-marker-image"
    });
  });

  it("does not expose the full image as the marker when thumbnail exists", () => {
    const collection = createPlaceFeatureCollection([makePlace("separate", "/place-images/full.jpg", "/place-thumbnails/thumb.jpg")]);

    expect(collection.features[0]?.properties.markerImage).toBe("/place-thumbnails/thumb.jpg");
    expect(collection.features[0]?.properties.markerImage).not.toBe("/place-images/full.jpg");
  });

  it("keeps a 500-place publication set in a single GeoJSON source", () => {
    const places = Array.from({ length: 500 }, (_, index) => makePlace(`place-${index}`, "/pwa/icon-512.png"));

    expect(createPlaceFeatureCollection(places).features).toHaveLength(500);
  });
});
