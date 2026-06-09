import { expect, test } from "@playwright/test";
import { appPath } from "./support/appPath";
import {
  getFirstRenderedMarkerPoint,
  getPlaceHoverProgress,
  waitForMarkerImagesWithLayer,
  waitForRenderedMarkerImages
} from "./support/mapLibre";

test("маркер показывает название при hover, а панорамирование и zoom не ломают интерфейс", async ({ page }) => {
  await page.goto(appPath("/"));

  const marker = page.getByRole("button", { name: /Парк-отель «Песчаный»/i });
  await expect(marker).toBeAttached();

  await expect(page.getByTestId("marker-tooltip")).toHaveCount(0);
  await waitForMarkerImagesWithLayer(page, "place-marker-labels");

  const map = page.getByTestId("map-shell");
  const box = await map.boundingBox();
  expect(box).not.toBeNull();

  const markerPoint = await getFirstRenderedMarkerPoint(page);

  expect(markerPoint).not.toBeNull();

  if (markerPoint) {
    await page.mouse.move(markerPoint.x, markerPoint.y);

    await expect.poll(() => getPlaceHoverProgress(page, markerPoint.id)).toBeGreaterThan(0);
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
  await page.goto(appPath("/"));

  await expect(page.getByTestId("map-shell")).toBeVisible();
  await page.mouse.click(615, 209);

  await waitForRenderedMarkerImages(page);
});
