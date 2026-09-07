import { describe, expect, it, vi } from "vitest";
import { addMarkerImages, MARKER_IMAGE_SIZE } from "../../src/components/map/markerImages";
import type { PlaceFeature } from "../../src/domain/places";

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

function makeImageData(): ImageData {
  return {
    data: new Uint8ClampedArray(MARKER_IMAGE_SIZE * MARKER_IMAGE_SIZE * 4),
    height: MARKER_IMAGE_SIZE,
    width: MARKER_IMAGE_SIZE
  } as ImageData;
}

describe("addMarkerImages", () => {
  it("updates an existing placeholder with the place mapThumbnail", async () => {
    const imageData = makeImageData();
    const map = {
      hasImage: vi.fn(() => true),
      addImage: vi.fn(),
      updateImage: vi.fn()
    };
    const loadImage = vi.fn(async () => ({ width: 128, height: 128 }) as HTMLImageElement);
    const createMarkerImageData = vi.fn(() => imageData);

    await addMarkerImages(map, [makePlace("thumb", "/place-images/full.jpg", "/place-map-thumbnails/thumb.webp")], {
      createMarkerImageData,
      loadImage
    });

    expect(loadImage).toHaveBeenCalledWith("/place-map-thumbnails/thumb.webp");
    expect(createMarkerImageData).toHaveBeenCalledWith({ width: 128, height: 128 });
    expect(map.updateImage).toHaveBeenCalledWith("place-marker-thumb", imageData);
    expect(map.addImage).not.toHaveBeenCalled();
  });

  it("adds a marker image when no placeholder exists", async () => {
    const imageData = makeImageData();
    const map = {
      hasImage: vi.fn(() => false),
      addImage: vi.fn(),
      updateImage: vi.fn()
    };

    await addMarkerImages(map, [makePlace("new", "/place-images/full.jpg", "/place-map-thumbnails/thumb.webp")], {
      createMarkerImageData: () => imageData,
      loadImage: async () => ({ width: 128, height: 128 }) as HTMLImageElement
    });

    expect(map.addImage).toHaveBeenCalledWith("place-marker-new", imageData, { pixelRatio: 2 });
    expect(map.updateImage).not.toHaveBeenCalled();
  });

  it("never uses the card image as a marker source", async () => {
    const loadedSources: string[] = [];

    await addMarkerImages(
      {
        hasImage: () => false,
        addImage: vi.fn(),
        updateImage: vi.fn()
      },
      [makePlace("map-only", "/place-images/full.jpg", "/place-map-thumbnails/map-only.webp")],
      {
        createMarkerImageData: makeImageData,
        loadImage: async (src) => {
          loadedSources.push(src);
          return { width: 128, height: 128 } as HTMLImageElement;
        }
      }
    );

    expect(loadedSources).toEqual(["/place-map-thumbnails/map-only.webp"]);
  });
});
