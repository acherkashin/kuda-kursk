import { expect, type Page } from "@playwright/test";

type PlaceFeatureId = string | number;

type RenderedMarkerPoint = {
  id: PlaceFeatureId;
  x: number;
  y: number;
};

export async function waitForMapSourcePlaces(page: Page, expectedCount: number) {
  await expect
    .poll(
      async () =>
        page.evaluate(async () => {
          const map = (window as typeof window & {
            __kurskMap?: {
              getSource: (sourceId: string) =>
                | {
                    getData?: () => Promise<{ features?: unknown[] }>;
                  }
                | undefined;
            };
          }).__kurskMap;
          const source = map?.getSource("places");

          if (!source?.getData) {
            return null;
          }

          const data = await source.getData();

          return Array.isArray(data.features) ? data.features.length : null;
        }),
      { timeout: 5_000 }
    )
    .toBe(expectedCount);
}

export async function waitForVisibleMapMarkers(page: Page) {
  await expect
    .poll(() => countRenderedMapFeatures(page, ["place-marker-images", "place-clusters"]), { timeout: 5_000 })
    .toBeGreaterThan(0);
}

export async function waitForMarkerImagesWithLayer(page: Page, layerId: string) {
  await expect
    .poll(
      async () =>
        page.evaluate((expectedLayerId) => {
          const map = (window as typeof window & {
            __kurskMap?: {
              getLayer: (layerId: string) => unknown;
              queryRenderedFeatures: (geometry?: unknown, options?: { layers?: string[] }) => unknown[];
            };
          }).__kurskMap;

          return (
            Boolean(map?.getLayer(expectedLayerId)) &&
            (map?.queryRenderedFeatures(undefined, { layers: ["place-marker-images"] }).length ?? 0) > 0
          );
        }, layerId),
      { timeout: 5_000 }
    )
    .toBe(true);
}

export async function waitForRenderedMarkerImages(page: Page) {
  await expect.poll(() => countRenderedMapFeatures(page, ["place-marker-images"]), { timeout: 5_000 }).toBeGreaterThan(0);
}

export async function getFirstRenderedMarkerPoint(page: Page): Promise<RenderedMarkerPoint | null> {
  return page.evaluate(() => {
    const map = (window as typeof window & {
      __kurskMap?: {
        queryRenderedFeatures: (geometry?: unknown, options?: { layers?: string[] }) => Array<{
          geometry: { coordinates: [number, number] };
          id?: string | number;
          properties?: { id?: string | number; name?: string };
        }>;
        project: (lngLat: [number, number]) => { x: number; y: number };
      };
    }).__kurskMap;
    const feature = map?.queryRenderedFeatures(undefined, { layers: ["place-marker-images"] })[0];

    if (!map || !feature) {
      return null;
    }

    const id = feature.id ?? feature.properties?.id;
    const point = map.project(feature.geometry.coordinates);

    return id === undefined ? null : { id, x: point.x, y: point.y };
  });
}

export async function getPlaceHoverProgress(page: Page, id: PlaceFeatureId) {
  return page.evaluate((featureId) => {
    const map = (window as typeof window & {
      __kurskMap?: {
        getFeatureState: (feature: { id: string | number; source: string }) => { hoverProgress?: number };
      };
    }).__kurskMap;

    return map?.getFeatureState({ id: featureId, source: "places" }).hoverProgress ?? 0;
  }, id);
}

async function countRenderedMapFeatures(page: Page, layers: string[]) {
  return page.evaluate((layerIds) => {
    const map = (window as typeof window & {
      __kurskMap?: {
        getLayer: (layerId: string) => unknown;
        queryRenderedFeatures: (geometry?: unknown, options?: { layers?: string[] }) => unknown[];
      };
    }).__kurskMap;

    if (!layerIds.every((layerId) => map?.getLayer(layerId))) {
      return 0;
    }

    return map?.queryRenderedFeatures(undefined, { layers: layerIds }).length ?? 0;
  }, layers);
}
