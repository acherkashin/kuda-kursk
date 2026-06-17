import { expect, test, type Page } from "@playwright/test";
import { appPath, appUrlPattern } from "./support/appPath";
import { waitForMapSourcePlaces, waitForVisibleMapMarkers } from "./support/mapLibre";

const DOZAPRAVKA_PLACE_COUNT = "19";
const ZAPISHU_ZARISUYU_PLACE_COUNT = "21";
const ROUTE_SWITCH_ATTEMPTS = 4;

async function expectMainMapLoaded(page: Page) {
  await expect(page.getByTestId("map-shell")).toBeVisible();
  await expect
    .poll(async () => Number(await page.getByTestId("map-shell").getAttribute("data-place-count")), { timeout: 15_000 })
    .toBeGreaterThan(0);
}

test.describe("публичные карты", () => {
  test("главная страница перенаправляет на основную карту", async ({ page }) => {
    await page.goto(appPath("/"));

    await expect(page).toHaveURL(appUrlPattern("/maps/main"));
    await expectMainMapLoaded(page);
  });

  test("каждая карта открывается как самостоятельный набор мест", async ({ page }) => {
    const routes = [
      { path: appPath("/maps/main"), title: "Куда в Курске" },
      { path: appPath("/maps/dozapravka"), title: "Дозаправка", count: DOZAPRAVKA_PLACE_COUNT },
      { path: appPath("/maps/zapishu-zarisuyu"), title: "Запишу, зарисую", count: ZAPISHU_ZARISUYU_PLACE_COUNT }
    ];

    for (const route of routes) {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });

      await expect(page.getByText(route.title, { exact: true }).first()).toBeVisible();
      await expect(page.getByAltText(`Логотип «${route.title}»`)).toBeVisible();
      if (route.count) {
        await expect
          .poll(async () => page.getByTestId("map-shell").getAttribute("data-place-count"), { timeout: 15_000 })
          .toBe(route.count);
      } else {
        await expectMainMapLoaded(page);
      }
      await expect(page.locator('section[aria-label="Открытая карта"]')).toHaveCount(0);
    }
  });

  test("старый community path больше не является публичным маршрутом", async ({ page }) => {
    await page.goto(appPath("/community/dozapravka"));

    await expect(page).toHaveURL(appUrlPattern("/maps/main"));
    await expectMainMapLoaded(page);
  });

  test("карточка места показывает image, а не marker thumbnail", async ({ page }) => {
    await page.goto(appPath("/maps/zapishu-zarisuyu"));
    await page.getByRole("button", { name: "КГУ" }).focus();
    await page.keyboard.press("Enter");

    const panel = page.getByTestId("place-details-panel");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("heading", { name: "КГУ" })).toBeVisible();
    await expect(panel.getByRole("img", { name: "КГУ" })).toHaveAttribute("src", /\/place-images\/1-image-local-dba58e76a6\.jpg$/);
  });

  test("неизвестная карта показывает fallback и возврат на основную карту", async ({ page }) => {
    await page.goto(appPath("/maps/unknown"));

    await expect(page.getByTestId("map-fallback")).toBeVisible();
    await page.getByRole("link", { name: /На основную карту/i }).click();
    await expect(page).toHaveURL(appUrlPattern("/maps/main"));
    await expectMainMapLoaded(page);
  });

  test("повторные переходы между основной картой и под-картой не оставляют MapLibre source пустым", async ({ page }) => {
    await page.goto(appPath("/maps/main"), { waitUntil: "domcontentloaded" });
    await expectMainMapLoaded(page);
    await waitForVisibleMapMarkers(page);

    for (let attempt = 0; attempt < ROUTE_SWITCH_ATTEMPTS; attempt += 1) {
      await page.getByRole("button", { name: "Дозаправка" }).focus();
      await page.keyboard.press("Enter");
      await page.getByTestId("open-submap").click();
      await page.waitForURL(appUrlPattern("/maps/dozapravka"));

      await expect(page.getByTestId("map-shell")).toHaveAttribute("data-place-count", DOZAPRAVKA_PLACE_COUNT);
      await waitForMapSourcePlaces(page, Number(DOZAPRAVKA_PLACE_COUNT));
      await waitForVisibleMapMarkers(page);

      await page.getByRole("button", { name: "На главную карту" }).click();
      await page.waitForURL(appUrlPattern("/maps/main"));

      await expectMainMapLoaded(page);
      await waitForVisibleMapMarkers(page);
    }
  });
});
