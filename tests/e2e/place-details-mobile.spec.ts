import { expect, test } from "@playwright/test";

test("на mobile карточка открывается как touch-friendly drawer", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Площадка на Боевке/i }).focus();
  await page.keyboard.press("Enter");

  const panel = page.getByTestId("place-details-panel");
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute("data-layout", isMobile ? "drawer" : "side-panel");
  await expect(panel.getByRole("button", { name: /Закрыть/i })).toBeVisible();
});
