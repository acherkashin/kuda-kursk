import { expect, test } from "@playwright/test";
import { appPath } from "./support/appPath";

test("поиск, пустое состояние и сброс обновляют видимые места", async ({ page }) => {
  await page.goto(appPath("/"));

  await page.getByRole("searchbox", { name: /Поиск/i }).fill("Песчаный");
  await expect(page.getByTestId("map-shell")).toHaveAttribute("data-place-count", "1");
  await expect(page.getByTestId("results-summary")).toContainText("1 место");

  await page.getByRole("searchbox", { name: /Поиск/i }).fill("несуществующее");
  await expect(page.getByTestId("empty-results")).toBeVisible();

  await page.getByRole("button", { name: "Сбросить поиск" }).click();
  await expect(page.getByTestId("map-shell")).toHaveAttribute("data-place-count", "42");
});
