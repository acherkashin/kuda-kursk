import { expect, test } from "@playwright/test";
import { appPath } from "./support/appPath";
import { getMapCamera, waitForMapSourcePlaces, waitForMapSourcePlacesWithinBounds } from "./support/mapLibre";
import { fillSearchBox } from "./support/searchControls";

test("поиск, пустое состояние и сброс обновляют видимые места", async ({ page }) => {
  await page.goto(appPath("/"));

  await fillSearchBox(page, "Песчаный");
  await expect(page.getByTestId("map-shell")).toHaveAttribute("data-place-count", "1");
  await expect(page.getByTestId("results-summary")).toContainText("1 место");

  await fillSearchBox(page, "несуществующее");
  await expect(page.getByTestId("empty-results")).toBeVisible();

  await page.getByRole("button", { name: "Сбросить поиск" }).click();
  await expect
    .poll(async () => Number(await page.getByTestId("map-shell").getAttribute("data-place-count")), { timeout: 15_000 })
    .toBeGreaterThan(1);
});

test("категория из URL фильтрует места и объединяется с поиском", async ({ page }) => {
  await page.goto(appPath("/maps/main?zoom=12.5"));

  const chaletChip = page.getByRole("button", { name: "🏡 Шале" });
  await expect(chaletChip).toHaveAttribute("aria-pressed", "false");
  await chaletChip.click();

  await expect
    .poll(() => new URL(page.url()).searchParams.get("category"))
    .toBe("chalet");
  await expect(page.getByTestId("map-shell")).toHaveAttribute("data-place-count", "13");
  await expect(page.getByTestId("results-summary")).toContainText("13 мест из");
  await waitForMapSourcePlacesWithinBounds(page);
  await expect.poll(() => new URL(page.url()).searchParams.get("zoom")).not.toBe("12.5");

  const fittedCamera = await getMapCamera(page);
  expect(fittedCamera).not.toBeNull();

  await fillSearchBox(page, "Шале у реки");
  await expect(page.getByTestId("map-shell")).toHaveAttribute("data-place-count", "1");
  expect(await getMapCamera(page)).toEqual(fittedCamera);

  await page.getByRole("button", { name: "Сбросить поиск" }).click();
  await chaletChip.click();

  await expect.poll(() => new URL(page.url()).searchParams.has("category")).toBe(false);
  await expect
    .poll(async () => Number(await page.getByTestId("map-shell").getAttribute("data-place-count")), { timeout: 15_000 })
    .toBeGreaterThan(13);
  expect(await getMapCamera(page)).toEqual(fittedCamera);

  await page.goto(appPath("/maps/main?category=chalet&zoom=12.5"));
  await waitForMapSourcePlaces(page, 13);
  await page.waitForTimeout(600);
  await expect.poll(async () => (await getMapCamera(page))?.zoom).toBeCloseTo(12.5, 2);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(appPath("/maps/main?category=chalet"));
  await waitForMapSourcePlaces(page, 13);
  await waitForMapSourcePlacesWithinBounds(page);
  await expect.poll(() => new URL(page.url()).searchParams.has("zoom")).toBe(true);

  await page.goto(appPath("/maps/main?category=chalet&place=1410"));
  await expect(chaletChip).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("map-shell")).toHaveAttribute("data-place-count", "13");
  await expect(page.getByTestId("place-details-panel")).toHaveCount(0);
  await expect.poll(() => new URL(page.url()).searchParams.has("place")).toBe(false);
});
