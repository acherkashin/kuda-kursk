import { expect, test } from "@playwright/test";

test("маркер показывает название при hover, а панорамирование и zoom не ломают интерфейс", async ({ page }) => {
  await page.goto("/");

  const marker = page.getByRole("button", { name: /Парк-отель «Песчаный»/i });
  await expect(marker).toBeAttached();

  await expect(page.getByTestId("marker-tooltip")).toHaveCount(0);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const map = (window as typeof window & {
          __kurskMap?: {
            getLayer: (layerId: string) => unknown;
            queryRenderedFeatures: (geometry?: unknown, options?: { layers?: string[] }) => unknown[];
          };
        }).__kurskMap;

        return Boolean(map?.getLayer("place-marker-labels")) && (map?.queryRenderedFeatures(undefined, { layers: ["place-marker-images"] }).length ?? 0) > 0;
      })
    )
    .toBe(true);

  const labelLayout = await page.evaluate(() => {
    const map = (window as typeof window & {
      __kurskMap?: {
        getLayoutProperty: (layerId: string, name: string) => unknown;
      };
    }).__kurskMap;

    return {
      anchor: map?.getLayoutProperty("place-marker-labels", "text-anchor"),
      justify: map?.getLayoutProperty("place-marker-labels", "text-justify"),
      lineHeight: map?.getLayoutProperty("place-marker-labels", "text-line-height"),
      maxWidth: map?.getLayoutProperty("place-marker-labels", "text-max-width")
    };
  });

  expect(labelLayout).toEqual({
    anchor: "top",
    justify: "center",
    lineHeight: 1.14,
    maxWidth: 10
  });

  const map = page.getByTestId("map-shell");
  const box = await map.boundingBox();
  expect(box).not.toBeNull();

  const markerPoint = await page.evaluate(() => {
    const map = (window as typeof window & {
      __kurskMap?: {
        getFeatureState: (feature: { id: string | number; source: string }) => { hoverProgress?: number };
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

  expect(markerPoint).not.toBeNull();

  if (markerPoint) {
    await page.mouse.move(markerPoint.x, markerPoint.y);

    await expect
      .poll(async () =>
        page.evaluate((id) => {
          const map = (window as typeof window & {
            __kurskMap?: {
              getFeatureState: (feature: { id: string | number; source: string }) => { hoverProgress?: number };
            };
          }).__kurskMap;

          return map?.getFeatureState({ id, source: "places" }).hoverProgress ?? 0;
        }, markerPoint.id)
      )
      .toBeGreaterThan(0);
  }

  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 40);
    await page.mouse.up();
    await page.mouse.wheel(0, -240);
  }

  await expect(page.getByLabel("Куда в Курске")).toBeVisible();
  await expect(marker).toBeAttached();
});

test("клик по кластеру раскрывает кликабельные маркеры", async ({ page }) => {
  await page.setViewportSize({ height: 720, width: 1280 });
  await page.goto("/");

  await expect(page.getByTestId("map-shell")).toBeVisible();
  await page.mouse.click(615, 209);

  await expect
    .poll(async () =>
      page.evaluate(() => {
        const map = (window as typeof window & {
          __kurskMap?: {
            queryRenderedFeatures: (
              geometry?: unknown,
              options?: { layers?: string[] }
            ) => unknown[];
          };
        }).__kurskMap;

        return map?.queryRenderedFeatures(undefined, { layers: ["place-marker-images"] }).length ?? 0;
      })
    )
    .toBeGreaterThan(0);
});
