import { expect, test } from "@playwright/test";
import { appPath } from "./support/appPath";
import { fillSearchBox } from "./support/searchControls";

test("аналитика не создаёт ym до consent и не отправляет сырой поисковый запрос", async ({ page }) => {
  await page.route("https://mc.yandex.ru/metrika/tag.js", async (route) => {
    await route.fulfill({ contentType: "application/javascript", body: "window.__metrikaScriptLoaded = true;" });
  });
  await page.goto(appPath("/"));

  await expect(page.getByTestId("analytics-consent")).toBeVisible();
  await expect(page.locator('script[src*="mc.yandex.ru/metrika"]')).toHaveCount(0);
  await expect(page.evaluate(() => "ym" in window)).resolves.toBe(false);

  await fillSearchBox(page, "секретный запрос");
  await page.getByRole("button", { name: "Принять аналитику" }).click();

  await expect(page.getByTestId("analytics-consent")).toHaveCount(0);
  await expect(page.evaluate(() => localStorage.getItem("kursk-map:analytics-consent:v1"))).resolves.toContain("accepted");
  await expect(page.locator('script[src*="mc.yandex.ru/metrika"]')).toHaveCount(1);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const queue = (window as typeof window & { ymQueue?: unknown[][] }).ymQueue ?? [];
        return queue.map((entry) => entry.slice(0, 4));
      })
    )
    .toContainEqual([123456, "hit", "/maps/main"]);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const queue = (window as typeof window & { ymQueue?: unknown[][] }).ymQueue ?? [];
        return queue.some((entry) => entry[1] === "reachGoal" && entry[2] === "app_open");
      })
    )
    .toBe(true);
  await expect(page.evaluate(() => document.documentElement.textContent?.includes("секретный запрос") ?? false)).resolves.toBe(
    false
  );
});
