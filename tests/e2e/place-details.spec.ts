import { expect, test } from "@playwright/test";
import { appPath, appUrlPattern } from "./support/appPath";
import {
  expectNoOpenedRouteUrls,
  expectOpenedRouteUrlToContain,
  mockRejectedRouteGeolocation,
  mockSuccessfulRouteGeolocation,
  rejectRouteGeolocation,
  resolveRouteGeolocation
} from "./support/routeGeolocation";

test("выбранное полное место открывает карточку с компактными действиями", async ({ page }) => {
  await page.goto(appPath("/"));
  await page.getByRole("button", { name: /Парк-отель «Песчаный»/i }).focus();
  await page.keyboard.press("Enter");

  const panel = page.getByTestId("place-details-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Парк-отель «Песчаный»" })).toBeVisible();
  await expect(panel.getByRole("img", { name: "Парк-отель «Песчаный»" })).toHaveAttribute("src", /\/place-images\/320-image-1b82889cd9\.jpg$/);
  await expect(panel.getByText("Парк-отель «Песчаный»")).toHaveCount(1);
  await expect(panel.getByRole("link", { name: "ВКонтакте" })).toHaveAttribute("href", "https://vk.com/peschaniy_park_hotel");
  await expect(panel.getByRole("link", { name: /Узнать подробнее/i })).toHaveCount(0);
  await expect(panel.getByRole("link", { name: /Яндекс/i })).toHaveCount(0);
  await expect(panel.getByRole("link", { name: /2ГИС/i })).toHaveCount(0);
  await expect(panel.getByRole("link", { name: /Google/i })).toHaveCount(0);

  await panel.getByRole("button", { name: /Построить маршрут/i }).click();

  await expect(panel.getByRole("link", { name: /Яндекс/i })).toHaveAttribute("href", /yandex\.ru/);
  await expect(panel.getByRole("link", { name: /2ГИС/i })).toHaveAttribute("href", /2gis\.ru/);
  await expect(panel.getByRole("link", { name: /Google/i })).toHaveAttribute("href", /google\.com/);
});

test("маршрут ждёт геолокацию перед открытием внешней карты", async ({ page }) => {
  await mockSuccessfulRouteGeolocation(page);

  await page.goto(appPath("/"));
  await page.getByRole("button", { name: /Парк-отель «Песчаный»/i }).focus();
  await page.keyboard.press("Enter");

  const panel = page.getByTestId("place-details-panel");
  await panel.getByRole("button", { name: /Построить маршрут/i }).click();

  const twoGisLink = panel.getByRole("link", { name: /2ГИС/i });
  await expect(twoGisLink).toHaveAttribute("href", /\/directions\/points\/\|/);
  await twoGisLink.click();

  await expectNoOpenedRouteUrls(page);
  await resolveRouteGeolocation(page);
  await expectOpenedRouteUrlToContain(page, "/directions/points/36.193,51.73|");
});

test("маршрут открывается без начальной точки, если геолокацию получить не удалось", async ({ page }) => {
  await mockRejectedRouteGeolocation(page);

  await page.goto(appPath("/"));
  await page.getByRole("button", { name: /Парк-отель «Песчаный»/i }).focus();
  await page.keyboard.press("Enter");

  const panel = page.getByTestId("place-details-panel");
  await panel.getByRole("button", { name: /Построить маршрут/i }).click();

  await panel.getByRole("link", { name: /2ГИС/i }).click();

  await expectNoOpenedRouteUrls(page);
  await rejectRouteGeolocation(page);
  await expectOpenedRouteUrlToContain(page, "/directions/points/|");
});

test("выбранное место фиксируется в URL и открывается по прямой ссылке", async ({ page }) => {
  await page.goto(appPath("/maps/main?place=320"));

  const panel = page.getByTestId("place-details-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Парк-отель «Песчаный»" })).toBeVisible();
  await expect(page).toHaveURL(appUrlPattern("/maps/main?place=320"));

  await panel.getByRole("button", { name: "Закрыть карточку" }).click();
  await expect(panel).toHaveCount(0);
  await expect(page).toHaveURL(appUrlPattern("/maps/main"));

  await page.getByRole("button", { name: /Парк-отель «Песчаный»/i }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(appUrlPattern("/maps/main?place=320"));
});

test("прямая ссылка выбранного места работает внутри карты сообщества", async ({ page }) => {
  await page.goto(appPath("/maps/dozapravka?place=1619"));

  const panel = page.getByTestId("place-details-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Кухмистерская Atilan" })).toBeVisible();
  await expect(page).toHaveURL(appUrlPattern("/maps/dozapravka?place=1619"));
});

test("редакционная Telegram-ссылка в карте Лизы Силаковой открывается как подробности", async ({ page }) => {
  await page.goto(appPath("/maps/illustrator-liza-silakova?place=7"));

  const panel = page.getByTestId("place-details-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "ЖД Вокзал" })).toBeVisible();
  await expect(panel.getByRole("link", { name: "Узнать подробнее" })).toHaveAttribute("href", "https://t.me/zapishu_zarisuyu/761");
  await expect(panel.getByRole("link", { name: "Telegram" })).toHaveCount(0);
});
