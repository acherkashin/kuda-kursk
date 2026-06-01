import { expect, test } from "@playwright/test";

test("карточка неполного места скрывает optional блоки без заглушек", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Водяная мельница/i }).focus();
  await page.keyboard.press("Enter");

  const panel = page.getByTestId("place-details-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Водяная мельница" })).toBeVisible();
  await expect(panel.getByTestId("place-tip")).toHaveCount(0);
  await expect(panel.getByTestId("external-links")).toHaveCount(0);
  await expect(panel.getByText(/нет данных/i)).toHaveCount(0);
});
