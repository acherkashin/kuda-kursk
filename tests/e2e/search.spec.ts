import { expect, test } from "@playwright/test";
import { appPath } from "./support/appPath";
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
