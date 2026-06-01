import { describe, expect, it, vi } from "vitest";
import { addMarkerImages, createDefaultMarkerImage, createMarkerImageData, MARKER_IMAGE_SIZE } from "../../src/components/map/markerImages";
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
        coordinates: "51.7, 36.1",
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

describe("marker image styling", () => {
  function captureCanvasStyles(run: () => ImageData) {
    const styles: string[] = [];
    const context = {
      arc: vi.fn(),
      beginPath: vi.fn(),
      clip: vi.fn(),
      drawImage: vi.fn(),
      fill: vi.fn(),
      getImageData: vi.fn(() => makeImageData()),
      restore: vi.fn(),
      save: vi.fn(),
      stroke: vi.fn(),
      set fillStyle(value: string) {
        styles.push(value);
      },
      set lineWidth(_value: number) {},
      set strokeStyle(value: string) {
        styles.push(value);
      }
    } as unknown as CanvasRenderingContext2D;
    const canvas = {
      getContext: vi.fn(() => context),
      height: 0,
      width: 0
    } as unknown as HTMLCanvasElement;
    const createElement = vi.spyOn(document, "createElement").mockReturnValue(canvas);

    try {
      run();
    } finally {
      createElement.mockRestore();
    }

    return styles;
  }

  it("uses neutral contrast for the default marker", () => {
    const styles = captureCanvasStyles(() => createDefaultMarkerImage());

    expect(styles).toContain("#ffffff");
    expect(styles).toContain("#111111");
    expect(styles).not.toContain("#2f7d5b");
  });

  it("uses a neutral ring around photographic markers", () => {
    const image = { height: 128, naturalHeight: 128, naturalWidth: 128, width: 128 } as HTMLImageElement;
    const styles = captureCanvasStyles(() => createMarkerImageData(image));

    expect(styles).toContain("#ffffff");
    expect(styles).toContain("#111111");
    expect(styles).not.toContain("#2f7d5b");
  });
});
