import { expect, test } from "@playwright/test";

test("выбранное полное место открывает карточку с компактными действиями", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Парк-отель «Песчаный»/i }).focus();
  await page.keyboard.press("Enter");

  const panel = page.getByTestId("place-details-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Парк-отель «Песчаный»" })).toBeVisible();
  await expect(panel.getByRole("img", { name: "Парк-отель «Песчаный»" })).toHaveAttribute("src", /\/place-images\/320-image-1b82889cd9\.jpg$/);
  await expect(panel.getByText("Парк-отель «Песчаный»")).toHaveCount(1);
  await expect(panel.getByRole("link", { name: /Узнать подробнее/i })).toHaveAttribute("href", "https://gokursk.ru/objects/park-otel-peschanyy/");
  await expect(panel.getByRole("link", { name: /Яндекс/i })).toHaveCount(0);
  await expect(panel.getByRole("link", { name: /2ГИС/i })).toHaveCount(0);
  await expect(panel.getByRole("link", { name: /Google/i })).toHaveCount(0);

  await panel.getByRole("button", { name: /Построить маршрут/i }).click();

  await expect(panel.getByRole("link", { name: /Яндекс/i })).toHaveAttribute("href", /yandex\.ru/);
  await expect(panel.getByRole("link", { name: /2ГИС/i })).toHaveAttribute("href", /2gis\.ru/);
  await expect(panel.getByRole("link", { name: /Google/i })).toHaveAttribute("href", /google\.com/);
});

test("выбранное место фиксируется в URL и открывается по прямой ссылке", async ({ page }) => {
  await page.goto("/maps/main?place=320");

  const panel = page.getByTestId("place-details-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Парк-отель «Песчаный»" })).toBeVisible();
  await expect(page).toHaveURL("/maps/main?place=320");

  await panel.getByRole("button", { name: "Закрыть карточку" }).click();
  await expect(panel).toHaveCount(0);
  await expect(page).toHaveURL("/maps/main");

  await page.getByRole("button", { name: /Парк-отель «Песчаный»/i }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/maps/main?place=320");
});

test("прямая ссылка выбранного места работает внутри карты сообщества", async ({ page }) => {
  await page.goto("/maps/dozapravka?place=1619");

  const panel = page.getByTestId("place-details-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Кухмистерская Atilan" })).toBeVisible();
  await expect(page).toHaveURL("/maps/dozapravka?place=1619");
});
