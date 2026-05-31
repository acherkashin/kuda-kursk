import { expect, test } from "@playwright/test";

test("маркер показывает название при hover, а панорамирование и zoom не ломают интерфейс", async ({ page }) => {
  await page.goto("/");

  const marker = page.getByRole("button", { name: /Площадка на Боевке/i });
  await expect(marker).toBeVisible();
  await marker.hover();

  await expect(page.getByTestId("marker-tooltip")).toContainText("Площадка на Боевке");

  const map = page.getByTestId("map-shell");
  const box = await map.boundingBox();
  expect(box).not.toBeNull();

  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 40);
    await page.mouse.up();
    await page.mouse.wheel(0, -240);
  }

  await expect(page.getByLabel("Куда в Курске")).toBeVisible();
  await expect(marker).toBeVisible();
});
