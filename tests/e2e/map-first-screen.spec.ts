import { expect, test } from "@playwright/test";
import { appPath, appUrlPattern } from "./support/appPath";

test.describe("первый экран карты", () => {
  test("desktop и mobile показывают карту, логотип и публичные маркеры", async ({ page }) => {
    const firstThumbnailLoaded = page.waitForResponse(
      (response) => response.url().includes(appPath("/place-thumbnails/320-f29160ce22.webp")) && response.ok()
    );

    await page.goto(appPath("/"));
    await firstThumbnailLoaded;

    await expect(page).toHaveURL(appUrlPattern("/maps/main"));
    await expect(page.getByTestId("map-shell")).toBeVisible();
    await expect
      .poll(async () => Number(await page.getByTestId("map-shell").getAttribute("data-place-count")), { timeout: 15_000 })
      .toBeGreaterThan(0);
    await expect(page.getByLabel("Куда в Курске")).toBeVisible();
    await expect(page.getByAltText("Логотип «Куда в Курске»")).toBeVisible();
    await expect(page.getByTestId("place-marker")).toHaveCount(0);
    await expect(page.getByTestId("map-place-control").first()).toBeAttached();
    await expect(page.getByRole("button", { name: /Парк-отель «Песчаный»/i })).toBeAttached();
  });

  test("первый экран не показывает нижнюю секцию открытой карты", async ({ page }) => {
    await page.goto(appPath("/maps/main"));
    await expect(page.getByTestId("map-shell")).toBeVisible();

    await expect(page.locator('section[aria-label="Открытая карта"]')).toHaveCount(0);
  });
});
