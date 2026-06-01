import { expect, test } from "@playwright/test";

test.describe("публичные карты", () => {
  test("главная страница перенаправляет на основную карту", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL("/maps/main");
    await expect(page.getByTestId("map-shell")).toHaveAttribute("data-place-count", "39");
  });

  test("каждая карта открывается как самостоятельный набор мест", async ({ page }) => {
    const routes = [
      { path: "/maps/main", title: "Куда в Курске", count: "39" },
      { path: "/maps/dozapravka", title: "Дозаправка", count: "19" },
      { path: "/maps/zapishu-zarisuyu", title: "Запишу, зарисую", count: "21" }
    ];

    for (const route of routes) {
      await page.goto(route.path);

      await expect(page.getByRole("heading", { name: route.title })).toBeVisible();
      await expect(page.getByTestId("map-shell")).toHaveAttribute("data-place-count", route.count);
    }
  });

  test("старый community path больше не является публичным маршрутом", async ({ page }) => {
    await page.goto("/community/dozapravka");

    await expect(page).toHaveURL("/maps/main");
    await expect(page.getByTestId("map-shell")).toHaveAttribute("data-place-count", "39");
  });

  test("карточка места показывает image, а не marker thumbnail", async ({ page }) => {
    await page.goto("/maps/zapishu-zarisuyu");
    await page.getByRole("button", { name: "КГУ" }).focus();
    await page.keyboard.press("Enter");

    const panel = page.getByTestId("place-details-panel");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("heading", { name: "КГУ" })).toBeVisible();
    await expect(panel.getByRole("img", { name: "КГУ" })).toHaveAttribute("src", /\/place-images\/1-image-local-dba58e76a6\.jpg$/);
  });

  test("неизвестная карта показывает fallback и возврат на основную карту", async ({ page }) => {
    await page.goto("/maps/unknown");

    await expect(page.getByTestId("map-fallback")).toBeVisible();
    await page.getByRole("link", { name: /На основную карту/i }).click();
    await expect(page).toHaveURL("/maps/main");
    await expect(page.getByTestId("map-shell")).toHaveAttribute("data-place-count", "39");
  });
});
