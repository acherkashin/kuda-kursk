import { expect, test } from "@playwright/test";

test.describe("первый экран карты", () => {
  test("desktop и mobile показывают карту, логотип и публичные маркеры", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("map-shell")).toBeVisible();
    await expect(page.getByLabel("Куда в Курске")).toBeVisible();
    await expect(page.getByAltText("Логотип Куда в Курске")).toBeVisible();
    await expect(page.getByTestId("place-marker")).toHaveCount(4);
    await expect(page.getByRole("button", { name: /Площадка на Боевке/i })).toBeVisible();
  });
});
