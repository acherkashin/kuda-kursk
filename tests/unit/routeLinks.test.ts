import { describe, expect, it } from "vitest";
import { buildRouteLinks, buildRouteUrl } from "../../src/domain/routeLinks";

describe("buildRouteLinks", () => {
  it("builds destination-only Yandex, 2GIS and Google route URLs from longitude-latitude coordinates", () => {
    const links = buildRouteLinks({ longitude: 36.2114, latitude: 51.7421 });

    expect(links).toEqual([
      expect.objectContaining({ provider: "yandex", label: "Яндекс.Карты" }),
      expect.objectContaining({ provider: "2gis", label: "2ГИС" }),
      expect.objectContaining({ provider: "google", label: "Google Maps" })
    ]);
    expect(links[0]?.url).toContain("rtext=~51.7421%2C36.2114");
    expect(links[1]?.url).toBe("https://2gis.ru/kursk/directions/points/|36.2114,51.7421");
    expect(links[2]?.url).toContain("api=1");
    expect(links[2]?.url).toContain("destination=51.7421%2C36.2114");
  });
});

describe("buildRouteUrl", () => {
  it("builds destination-only fallback route URLs", () => {
    const destination = { longitude: 36.2114, latitude: 51.7421 };

    expect(buildRouteUrl({ provider: "yandex", destination })).toBe(
      "https://yandex.ru/maps/?rtext=~51.7421%2C36.2114&rtt=auto"
    );
    expect(buildRouteUrl({ provider: "2gis", destination })).toBe(
      "https://2gis.ru/kursk/directions/points/|36.2114,51.7421"
    );
    expect(buildRouteUrl({ provider: "google", destination })).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=51.7421%2C36.2114"
    );
  });

  it("builds route URLs with origin and destination coordinates", () => {
    const origin = { longitude: 36.193, latitude: 51.73 };
    const destination = { longitude: 36.2114, latitude: 51.7421 };

    expect(buildRouteUrl({ provider: "yandex", origin, destination })).toBe(
      "https://yandex.ru/maps/?rtext=51.73%2C36.193~51.7421%2C36.2114&rtt=auto"
    );
    expect(buildRouteUrl({ provider: "2gis", origin, destination })).toBe(
      "https://2gis.ru/kursk/directions/points/36.193,51.73|36.2114,51.7421"
    );
    expect(buildRouteUrl({ provider: "google", origin, destination })).toBe(
      "https://www.google.com/maps/dir/?api=1&origin=51.73%2C36.193&destination=51.7421%2C36.2114"
    );
  });
});
