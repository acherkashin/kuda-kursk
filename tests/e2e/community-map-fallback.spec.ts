import { expect, test } from "@playwright/test";

test("неизвестная community route показывает fallback и возврат на основную карту", async ({ page }) => {
  await page.goto("/community/unknown-slug");

  await expect(page.getByTestId("community-fallback")).toBeVisible();
  await page.getByRole("link", { name: /На основную карту/i }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByTestId("place-marker")).toHaveCount(4);
});
