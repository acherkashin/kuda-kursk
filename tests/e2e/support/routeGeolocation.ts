import { expect, type Page } from "@playwright/test";

export async function mockSuccessfulRouteGeolocation(page: Page) {
  await page.addInitScript(() => {
    let pendingSuccess: PositionCallback | null = null;

    const installRouteWindowOpenSpy = () => {
      Object.defineProperty(window, "__openedRouteUrls", {
        configurable: true,
        value: [] as string[]
      });

      window.open = (url?: string | URL) => {
        (window as unknown as { __openedRouteUrls: string[] }).__openedRouteUrls.push(String(url ?? ""));

        return { opener: null } as Window;
      };
    };

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success: PositionCallback) => {
          pendingSuccess = success;
        }
      }
    });

    installRouteWindowOpenSpy();

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
  });
}

export async function mockRejectedRouteGeolocation(page: Page) {
  await page.addInitScript(() => {
    let pendingError: PositionErrorCallback | null = null;

    const installRouteWindowOpenSpy = () => {
      Object.defineProperty(window, "__openedRouteUrls", {
        configurable: true,
        value: [] as string[]
      });

      window.open = (url?: string | URL) => {
        (window as unknown as { __openedRouteUrls: string[] }).__openedRouteUrls.push(String(url ?? ""));

        return { opener: null } as Window;
      };
    };

    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (_success: PositionCallback, error?: PositionErrorCallback | null) => {
          pendingError = error ?? null;
        }
      }
    });

    installRouteWindowOpenSpy();

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
  });
}

export async function expectNoOpenedRouteUrls(page: Page) {
  await expect(page.evaluate(() => (window as unknown as { __openedRouteUrls: string[] }).__openedRouteUrls)).resolves.toHaveLength(0);
}

export async function resolveRouteGeolocation(page: Page) {
  await page.evaluate(() => (window as unknown as { __resolveGeolocation: () => void }).__resolveGeolocation());
}

export async function rejectRouteGeolocation(page: Page) {
  await page.evaluate(() => (window as unknown as { __rejectGeolocation: () => void }).__rejectGeolocation());
}

export async function expectOpenedRouteUrlToContain(page: Page, expectedPart: string) {
  await expect.poll(() => getFirstOpenedRouteUrl(page), { timeout: 5_000 }).toContain(expectedPart);
}

async function getFirstOpenedRouteUrl(page: Page) {
  return page.evaluate(() => (window as unknown as { __openedRouteUrls: string[] }).__openedRouteUrls[0] ?? "");
}
