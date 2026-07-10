import { expect, test } from "@playwright/test";
import { appPath } from "./support/appPath";

test("manifest, service worker helper и offline app shell доступны", async ({ page, context }) => {
  const manifestResponse = await page.request.get(appPath("/manifest.webmanifest"));
  expect(manifestResponse.ok()).toBe(true);
  const manifest = (await manifestResponse.json()) as {
    name: string;
    short_name: string;
    icons: Array<{ sizes: string }>;
  };
  expect(manifest.name).toBe("Куда в Курске");
  expect(manifest.short_name).toBe("Куда в Курске");
  expect(manifest.icons.map((icon) => icon.sizes)).toContain("192x192");
  expect(manifest.icons.map((icon) => icon.sizes)).toContain("512x512");

  await page.goto(appPath("/"));
  await expect(page.getByTestId("map-shell")).toBeVisible();

  await context.setOffline(true);
  await expect(page.getByTestId("map-shell")).toBeVisible();
  await context.setOffline(false);
});
