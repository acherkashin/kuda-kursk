import { describe, expect, it } from "vitest";
import type { PlaceFeature } from "../../src/domain/places";
import { createPlaceFeatureCollection } from "../../src/components/map/placeSource";

function makePlace(id: string, image = "/place-images/full.jpg", mapThumbnail = "/place-map-thumbnails/thumb.webp"): PlaceFeature {
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
        image,
        mapThumbnail
      }
    }
  };
}

describe("createPlaceFeatureCollection", () => {
  it("uses only mapThumbnail as marker image", () => {
    const collection = createPlaceFeatureCollection([
      makePlace("thumb", "/images/full.jpg", "/place-map-thumbnails/thumb.webp"),
      makePlace("image", "/images/only-full.jpg", "/place-map-thumbnails/image.webp")
    ]);

    expect(collection.features[0]?.properties).toMatchObject({
      markerImage: "/place-map-thumbnails/thumb.webp",
      markerImageId: "place-marker-thumb"
    });
    expect(collection.features[1]?.properties).toMatchObject({
      markerImage: "/place-map-thumbnails/image.webp",
      markerImageId: "place-marker-image"
    });
  });

  it("does not expose the full image as the marker", () => {
    const collection = createPlaceFeatureCollection([makePlace("separate", "/place-images/full.jpg", "/place-map-thumbnails/thumb.webp")]);

    expect(collection.features[0]?.properties.markerImage).toBe("/place-map-thumbnails/thumb.webp");
    expect(collection.features[0]?.properties.markerImage).not.toBe("/place-images/full.jpg");
  });

  it("keeps a 500-place publication set in a single GeoJSON source", () => {
    const places = Array.from({ length: 500 }, (_, index) => makePlace(`place-${index}`, "/place-images/icon-512.png", "/place-map-thumbnails/icon-512.webp"));

    expect(createPlaceFeatureCollection(places).features).toHaveLength(500);
  });

  it("adds runtime marker layout properties when they are available", () => {
    const collection = createPlaceFeatureCollection(
      [makePlace("shifted", "/images/full.jpg", "/place-map-thumbnails/shifted.webp")],
      new Map([
        [
          "shifted",
          {
            labelOffset: [2, 4.65],
            markerOffset: [24, 24],
            sortKey: 1
          }
        ]
      ])
    );

    expect(collection.features[0]?.properties).toMatchObject({
      markerOffset: [24, 24],
      markerSortKey: 1,
      markerTextOffset: [2, 4.65]
    });
  });
});
