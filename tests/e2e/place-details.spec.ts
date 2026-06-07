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
  await expect(panel.getByRole("link", { name: "ВКонтакте" })).toHaveAttribute("href", "https://vk.com/peschany_park_hotel");
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
  await page.addInitScript(() => {
    let pendingSuccess: PositionCallback | null = null;

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          pendingSuccess = success;
        }
      }
    });

    Object.defineProperty(window, "__openedRouteUrls", {
      configurable: true,
      value: [] as string[]
    });

    Object.defineProperty(window, "__resolveGeolocation", {
      configurable: true,
      value: () => {
        pendingSuccess?.({
          coords: {
            latitude: 51.73,
            longitude: 36.193,
            accuracy: 10,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        });
      }
    });

    window.open = (url?: string | URL) => {
      (window as unknown as { __openedRouteUrls: string[] }).__openedRouteUrls.push(String(url ?? ""));

      return { opener: null } as Window;
    };
  });

  await page.goto("/");
  await page.getByRole("button", { name: /Парк-отель «Песчаный»/i }).focus();
  await page.keyboard.press("Enter");

  const panel = page.getByTestId("place-details-panel");
  await panel.getByRole("button", { name: /Построить маршрут/i }).click();

  const twoGisLink = panel.getByRole("link", { name: /2ГИС/i });
  await expect(twoGisLink).toHaveAttribute("href", /\/directions\/points\/\|/);
  await twoGisLink.click();

  await expect(page.evaluate(() => (window as unknown as { __openedRouteUrls: string[] }).__openedRouteUrls)).resolves.toHaveLength(0);
  await page.evaluate(() => (window as unknown as { __resolveGeolocation: () => void }).__resolveGeolocation());

  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __openedRouteUrls: string[] }).__openedRouteUrls[0] ?? ""))
    .toContain("/directions/points/36.193,51.73|");
});

test("маршрут открывается без начальной точки, если геолокацию получить не удалось", async ({ page }) => {
  await page.addInitScript(() => {
    let pendingError: PositionErrorCallback | null = null;

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (_success: PositionCallback, error?: PositionErrorCallback | null) => {
          pendingError = error ?? null;
        }
      }
    });

    Object.defineProperty(window, "__openedRouteUrls", {
      configurable: true,
      value: [] as string[]
    });

    Object.defineProperty(window, "__rejectGeolocation", {
      configurable: true,
      value: () => {
        pendingError?.({
          code: 1,
          message: "Permission denied",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        } as GeolocationPositionError);
      }
    });

    window.open = (url?: string | URL) => {
      (window as unknown as { __openedRouteUrls: string[] }).__openedRouteUrls.push(String(url ?? ""));

      return { opener: null } as Window;
    };
  });

  await page.goto("/");
  await page.getByRole("button", { name: /Парк-отель «Песчаный»/i }).focus();
  await page.keyboard.press("Enter");

  const panel = page.getByTestId("place-details-panel");
  await panel.getByRole("button", { name: /Построить маршрут/i }).click();

  await panel.getByRole("link", { name: /2ГИС/i }).click();

  await expect(page.evaluate(() => (window as unknown as { __openedRouteUrls: string[] }).__openedRouteUrls)).resolves.toHaveLength(0);
  await page.evaluate(() => (window as unknown as { __rejectGeolocation: () => void }).__rejectGeolocation());

  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __openedRouteUrls: string[] }).__openedRouteUrls[0] ?? ""))
    .toContain("/directions/points/|");
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

test("редакционная Telegram-ссылка в карте зарисовок открывается как подробности", async ({ page }) => {
  await page.goto("/maps/zapishu-zarisuyu?place=7");

  const panel = page.getByTestId("place-details-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "ЖД Вокзал" })).toBeVisible();
  await expect(panel.getByRole("link", { name: "Узнать подробнее" })).toHaveAttribute("href", "https://t.me/zapishu_zarisuyu/761");
  await expect(panel.getByRole("link", { name: "Telegram" })).toHaveCount(0);
});
