import { expect, test } from "@playwright/test";

test("аналитика не создаёт ym до consent и не отправляет сырой поисковый запрос", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("analytics-consent")).toBeVisible();
  await expect(page.locator('script[src*="mc.yandex.ru/metrika"]')).toHaveCount(0);
  await expect(page.evaluate(() => "ym" in window)).resolves.toBe(false);

  await page.getByRole("searchbox", { name: /Поиск/i }).fill("секретный запрос");
  await page.getByRole("button", { name: "Принять аналитику" }).click();

  await expect(page.getByTestId("analytics-consent")).toHaveCount(0);
  await expect(page.evaluate(() => localStorage.getItem("kursk-map:analytics-consent:v1"))).resolves.toContain("accepted");
  await expect(page.evaluate(() => document.documentElement.textContent?.includes("секретный запрос") ?? false)).resolves.toBe(
    false
  );
});
