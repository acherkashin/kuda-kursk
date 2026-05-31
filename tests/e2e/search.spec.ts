import { expect, test } from "@playwright/test";

test("поиск, пустое состояние и сброс обновляют видимые места", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("searchbox", { name: /Поиск/i }).fill("Боевке");
  await expect(page.getByTestId("place-marker")).toHaveCount(1);
  await expect(page.getByTestId("results-summary")).toContainText("1 место");

  await page.getByRole("searchbox", { name: /Поиск/i }).fill("несуществующее");
  await expect(page.getByTestId("empty-results")).toBeVisible();

  await page.getByTestId("results-summary").getByRole("button", { name: "Сбросить" }).click();
  await expect(page.getByTestId("place-marker")).toHaveCount(4);
});
