import { expect, test } from "@playwright/test";

test("выбранное полное место открывает карточку и route actions", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Парк-отель «Песчаный»/i }).focus();
  await page.keyboard.press("Enter");

  const panel = page.getByTestId("place-details-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Парк-отель «Песчаный»" })).toBeVisible();
  await expect(panel.getByRole("img", { name: "Парк-отель «Песчаный»" })).toHaveAttribute("src", /\/place-images\/320-image-1b82889cd9\.jpg$/);
  await expect(panel.getByRole("link", { name: /Яндекс/i })).toHaveAttribute("href", /yandex\.ru/);
  await expect(panel.getByRole("link", { name: /2ГИС/i })).toHaveAttribute("href", /2gis\.ru/);
  await expect(panel.getByRole("link", { name: /Google/i })).toHaveAttribute("href", /google\.com/);
});
