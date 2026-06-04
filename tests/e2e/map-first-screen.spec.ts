import { expect, test } from "@playwright/test";

test.describe("первый экран карты", () => {
  test("desktop и mobile показывают карту, логотип и публичные маркеры", async ({ page }) => {
    const firstThumbnailLoaded = page.waitForResponse(
      (response) => response.url().includes("/place-thumbnails/320-f29160ce22.webp") && response.ok()
    );

    await page.goto("/");
    await firstThumbnailLoaded;

    await expect(page).toHaveURL("/maps/main");
    await expect(page.getByTestId("map-shell")).toBeVisible();
    await expect(page.getByTestId("map-shell")).toHaveAttribute("data-place-count", "39");
    await expect(page.getByLabel("Куда в Курске")).toBeVisible();
    await expect(page.getByAltText("Логотип Куда в Курске")).toBeVisible();
    await expect(page.getByTestId("place-marker")).toHaveCount(0);
    await expect(page.getByTestId("map-place-control")).toHaveCount(39);
    await expect(page.getByRole("button", { name: /Парк-отель «Песчаный»/i })).toBeAttached();
  });

  test("первый экран не показывает нижнюю секцию открытой карты", async ({ page }) => {
    await page.goto("/maps/main");
    await expect(page.getByTestId("map-shell")).toBeVisible();

    await expect(page.locator('section[aria-label="Открытая карта"]')).toHaveCount(0);
  });
});
