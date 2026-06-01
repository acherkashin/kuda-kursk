import { expect, test } from "@playwright/test";

const floatingSelectors = [
  ["logo", 'a[aria-label="Куда в Курске"]'],
  ["search", 'section[aria-label="Поиск"]'],
  ["mapHeader", 'section[aria-label="Открытая карта"]'],
  ["details", '[data-testid="place-details-panel"]'],
  ["analytics", '[data-testid="analytics-consent"]'],
  ["analyticsToggle", 'button[aria-label="Настройки аналитики"]'],
  ["mapControls", ".maplibregl-ctrl-bottom-right"]
] as const;

async function expectFloatingRegionsDoNotOverlap(page: import("@playwright/test").Page) {
  const intersections = await page.evaluate((selectors) => {
    const rects = selectors.flatMap(([name, selector]) => {
      const element = document.querySelector(selector);

      if (!element) {
        return [];
      }

      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      if (rect.width === 0 || rect.height === 0 || style.visibility === "hidden" || style.display === "none") {
        return [];
      }

      return [
        {
          bottom: rect.bottom,
          left: rect.left,
          name,
          right: rect.right,
          top: rect.top
        }
      ];
    });

    const overlaps: string[] = [];

    for (let index = 0; index < rects.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < rects.length; nextIndex += 1) {
        const first = rects[index];
        const second = rects[nextIndex];
        const width = Math.max(0, Math.min(first.right, second.right) - Math.max(first.left, second.left));
        const height = Math.max(0, Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top));

        if (width * height > 1) {
          overlaps.push(`${first.name}/${second.name}`);
        }
      }
    }

    return overlaps;
  }, floatingSelectors);

  expect(intersections).toEqual([]);
}

test.describe("первый экран карты", () => {
  test("desktop и mobile показывают карту, логотип и публичные маркеры", async ({ page }) => {
    const firstThumbnailLoaded = page.waitForResponse(
      (response) => response.url().includes("/place-thumbnails/320-f29160ce22.webp") && response.ok()
    );

    await page.goto("/");
    await firstThumbnailLoaded;

    await expect(page).toHaveURL("/maps/main");
    await expect(page.getByTestId("map-shell")).toBeVisible();
    await expect(page.getByTestId("map-shell")).toHaveAttribute("data-place-count", "39");
    await expect(page.getByLabel("Куда в Курске")).toBeVisible();
    await expect(page.getByAltText("Логотип Куда в Курске")).toBeVisible();
    await expect(page.getByTestId("place-marker")).toHaveCount(0);
    await expect(page.getByTestId("map-place-control")).toHaveCount(39);
    await expect(page.getByRole("button", { name: /Парк-отель «Песчаный»/i })).toBeAttached();
  });

  test("floating UI regions do not overlap on desktop and mobile", async ({ page }) => {
    for (const viewport of [
      { height: 720, width: 1280 },
      { height: 844, width: 390 }
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await expect(page.getByTestId("map-shell")).toBeVisible();

      await expectFloatingRegionsDoNotOverlap(page);

      await page.getByRole("button", { name: /Парк-отель «Песчаный»/i }).focus();
      await page.keyboard.press("Enter");
      await expect(page.getByTestId("place-details-panel")).toBeVisible();
      await expectFloatingRegionsDoNotOverlap(page);
    }
  });
});
