import { describe, expect, it, vi } from "vitest";
import { addMarkerImages, MARKER_IMAGE_SIZE } from "../../src/components/map/markerImages";
import type { PlaceFeature } from "../../src/domain/places";

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

function makeImageData(): ImageData {
  return {
    data: new Uint8ClampedArray(MARKER_IMAGE_SIZE * MARKER_IMAGE_SIZE * 4),
    height: MARKER_IMAGE_SIZE,
    width: MARKER_IMAGE_SIZE
  } as ImageData;
}

describe("addMarkerImages", () => {
  it("updates an existing placeholder with the place thumbnail", async () => {
    const imageData = makeImageData();
    const map = {
      hasImage: vi.fn(() => true),
      addImage: vi.fn(),
      updateImage: vi.fn()
    };
    const loadImage = vi.fn(async () => ({ width: 128, height: 128 }) as HTMLImageElement);
    const createMarkerImageData = vi.fn(() => imageData);

    await addMarkerImages(map, [makePlace("thumb", "/place-images/full.jpg", "/place-thumbnails/thumb.jpg")], {
      createMarkerImageData,
      loadImage
    });

    expect(loadImage).toHaveBeenCalledWith("/place-thumbnails/thumb.jpg");
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

    await addMarkerImages(map, [makePlace("new", "/place-images/full.jpg", "/place-thumbnails/thumb.jpg")], {
      createMarkerImageData: () => imageData,
      loadImage: async () => ({ width: 128, height: 128 }) as HTMLImageElement
    });

    expect(map.addImage).toHaveBeenCalledWith("place-marker-new", imageData, { pixelRatio: 2 });
    expect(map.updateImage).not.toHaveBeenCalled();
  });

  it("uses image as a fallback marker source when thumbnail is absent", async () => {
    const loadedSources: string[] = [];

    await addMarkerImages(
      {
        hasImage: () => false,
        addImage: vi.fn(),
        updateImage: vi.fn()
      },
      [makePlace("fallback", "/place-images/full.jpg")],
      {
        createMarkerImageData: makeImageData,
        loadImage: async (src) => {
          loadedSources.push(src);
          return { width: 128, height: 128 } as HTMLImageElement;
        }
      }
    );

    expect(loadedSources).toEqual(["/place-images/full.jpg"]);
  });
});
